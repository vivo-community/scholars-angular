import { Component, Input, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { isPlatformBrowser, isPlatformServer, APP_BASE_HREF } from '@angular/common';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Router, Params } from '@angular/router';

import { Store, select } from '@ngrx/store';

import { Observable, Subscription } from 'rxjs';
import { skipWhile, debounceTime, distinctUntilChanged, take, flatMap } from 'rxjs/operators';

import { AppState } from '../../core/store';
import { DiscoveryView, Facet, Filter } from '../../core/model/view';

import { selectActiveThemeOrganization } from '../../core/store/theme';
import { selectRouterSearchQuery, selectRouterQueryParams } from '../../core/store/router';

import { getQueryParams } from '../utilities/view.utility';

export interface SearchBoxStyles {
  label: {
    margin: string;
    color: string;
  };
  inputBoxShadow: string;
}

@Component({
  selector: 'scholars-search-box',
  templateUrl: 'search-box.component.html',
  styleUrls: ['search-box.component.scss'],
})
export class SearchBoxComponent implements OnInit, OnDestroy {

  @Input() view: DiscoveryView;

  @Input() styles: SearchBoxStyles = {
    label: {
      margin: '0px 0px 5x 0px',
      color: '#4d4d4d',
    },
    inputBoxShadow: '1px 1px 0px 0px #bbb',
  };

  @Input() live = false;

  @Input() placeholder = '';

  @Input() debounce = 750;

  public form: FormGroup;

  public queryParams: Observable<Params>;

  public organization: Observable<string>;

  private subscriptions: Subscription[];

  private setup = false;

  constructor(
    @Inject(APP_BASE_HREF) private baseHref: string,
    @Inject(PLATFORM_ID) private platformId: string,
    private formBuilder: FormBuilder,
    private store: Store<AppState>,
    private router: Router
  ) {
    this.subscriptions = [];
  }

  ngOnInit(): void {
    this.queryParams = this.store.pipe(select(selectRouterQueryParams));
    this.organization = this.store.pipe(select(selectActiveThemeOrganization));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

  public setupForm(): boolean {
    if (!this.setup) {
      const formGroup = {
        query: new FormControl(),
        collection: new FormControl(),
        facets: new FormControl(),
      };

      if (this.view.filters && this.view.filters.length > 0) {
        this.view.filters.forEach((filter: Filter) => {
          formGroup[`${filter.field}.filter`] = new FormControl();
        });
      }

      this.form = this.formBuilder.group(formGroup);

      if (this.view.facets && this.view.facets.length > 0) {
        let facets = '';
        this.view.facets.forEach((facet: Facet) => {
          facets += facets.length > 0 ? `,${facet.field}` : facet.field;
        });
        this.form.patchValue({ facets });
      }

      if (this.view.filters && this.view.filters.length > 0) {
        this.view.filters.forEach((filter: Filter) => {
          const field = {};
          field[`${filter.field}.filter`] = filter.value;
          this.form.patchValue(field);
        });
      }

      const collection = 'individual';

      this.form.patchValue({ collection });

      this.subscriptions.push(this.store.pipe(
        select(selectRouterSearchQuery),
        skipWhile((query: string) => query === undefined)
      ).subscribe((query: string) => this.form.patchValue({ query })));

      if (this.live) {
        this.subscriptions.push(
          this.form.controls.query.valueChanges.pipe(
            debounceTime(this.debounce),
            distinctUntilChanged(),
            flatMap(() => this.queryParams.pipe(take(1)))
          ).subscribe((params) => this.onSearch(params)));
      }

      this.setup = true;
    }
    return this.setup;
  }

  public isBrowserRendered(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  public isServerRendered(): boolean {
    return isPlatformServer(this.platformId);
  }

  public onSearch(params: Params): void {
    this.router.navigate(this.getDiscoveryRouterLink(), {
      queryParams: this.getSearchDiscoveryQueryParams(params, this.form.value.query),
      preserveFragment: true,
    });
  }

  public getAction(): string {
    return `${this.baseHref}discovery/${this.view.name}`;
  }

  public getFilterName(filter: Filter): string {
    return `${filter.field}.filter`;
  }

  public getDiscoveryRouterLink(): string[] {
    return [`/discovery/${this.view.name}`];
  }

  public getSearchDiscoveryQueryParams(params: Params, query: string): Params {
    const queryParams: Params = getQueryParams(this.view);
    if (query && query.length > 0) {
      queryParams.q = query;
    } else {
      queryParams.q = undefined;
    }
    queryParams.page = this.live ? 1 : undefined;
    if (this.live && params.filters && params.filters.length > 0) {
      params.filters.split(',').forEach((field: string) => {
        queryParams[`${field}.filter`] = params[`${field}.filter`];
        queryParams[`${field}.opKey`] = params[`${field}.opKey`];
      });
      queryParams.filters = params.filters;
    }
    return queryParams;
  }

  public getDefaultDiscoveryQueryParams(): Params {
    return getQueryParams(this.view);
  }

}
