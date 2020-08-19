import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Params, Router, NavigationStart } from '@angular/router';
import { Store, select } from '@ngrx/store';

import { scheduled, Subscription, Observable } from 'rxjs';
import { filter, map, tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { queueScheduler } from 'rxjs';

import { AppState } from '../../../core/store';
import { DialogButtonType, DialogControl } from '../../../core/model/dialog';
import { Facet, FacetType, CollectionView, OpKey } from '../../../core/model/view';
import { Facetable } from '../../../core/model/request';
import { SdrFacet, SdrFacetEntry, SdrCollection } from '../../../core/model/sdr';

import { IndividualRepo } from '../../../core/model/discovery/repo/individual.repo';

import { CustomRouterState } from '../../../core/store/router/router.reducer';
import { selectRouterState, selectRouterQueryParams } from '../../../core/store/router';
import { selectCollectionViewByName } from '../../../core/store/sdr';

import { createSdrRequest, buildDateYearFilterValue, buildNumberRangeFilterValue, getFacetFilterLabel } from '../../utilities/discovery.utility';

import * as fromDialog from '../../../core/store/dialog/dialog.actions';

@Component({
  selector: 'scholars-facet-entries',
  templateUrl: './facet-entries.component.html',
  styleUrls: ['./facet-entries.component.scss'],
})
export class FacetEntriesComponent implements OnDestroy, OnInit {

  @Input() name: string;

  @Input() field: string;

  public queryParams: Observable<Params>;

  public routerState: Observable<CustomRouterState>;

  public collectionView: Observable<CollectionView>;

  public facet: Observable<Facet>;

  public sdrFacet: Observable<SdrFacet>;

  public page: number;

  public pageSize: number;

  public routerLink = [];

  public form: FormGroup;

  public dialog: DialogControl;

  private subscriptions: Subscription[];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private store: Store<AppState>,
    private translate: TranslateService,
    private individualRepo: IndividualRepo
  ) {
    this.subscriptions = [];
    this.page = 2;
    this.pageSize = 10;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

  ngOnInit() {
    this.routerState = this.store.pipe(
      select(selectRouterState),
      filter((router: any) => router !== undefined),
      map((router: any) => router.state)
    );

    const formGroup = {
      filter: new FormControl()
    };

    this.form = this.formBuilder.group(formGroup);

    this.queryParams = this.store.pipe(select(selectRouterQueryParams));

    this.subscriptions.push(
      this.routerState.subscribe((routerState: CustomRouterState) => {

        this.dialog = {
          title: scheduled([this.name], queueScheduler),
          close: {
            type: DialogButtonType.OUTLINE_WARNING,
            label: this.translate.get('SHARED.DIALOG.FACET_ENTRIES.CANCEL'),
            action: () => {
              this.store.dispatch(new fromDialog.CloseDialogAction());
            },
            disabled: () => scheduled([false], queueScheduler),
          },
        };

        const collectionViewType = routerState.url.startsWith('/directory') ? 'directoryViews' : 'discoveryViews';

        this.collectionView = this.store.pipe(select(selectCollectionViewByName(collectionViewType, routerState.params.view)));

        this.facet = this.store.pipe(
          select(selectCollectionViewByName(collectionViewType, routerState.params.view)),
          map((view: CollectionView) => view.facets.find((facet: Facet) => facet.name === this.name)),
          tap((facet: Facet) => {

            const originalSdrRequest = createSdrRequest(routerState);

            const sdrRequest = Object.assign(originalSdrRequest, {
              page: {
                number: 1,
                size: 1,
                sort: originalSdrRequest.page.sort
              },
              facets: originalSdrRequest.facets.filter((f: Facetable) => f.field === facet.field).map((f: Facetable) => {
                f.pageNumber = 1;
                f.pageSize = 2147483647;
                return f;
              }),
              highlight: {},
              query: Object.assign(originalSdrRequest.query, {
                fields: 'class'
              })
            });

            // NOTE: isolating request for facets without going through the stores, leaving facets in store intact
            this.sdrFacet = this.individualRepo.search(sdrRequest).pipe(
              map((collection: SdrCollection) => collection.facets[0]),
              tap((sdrFacet) => {
                const content = Object.assign([], sdrFacet.entries.content);
                let lastTerm = '';
                this.subscriptions.push(
                  this.form.controls.filter.valueChanges.pipe(
                    debounceTime(500),
                    distinctUntilChanged()
                  ).subscribe((term: string) => {
                    const currentContent = lastTerm.length > term.length ? content : sdrFacet.entries.content;
                    lastTerm = term = term.toLowerCase();
                    sdrFacet.entries.content = currentContent.filter((entry) => {
                      const index = entry.valueKey.toLowerCase().indexOf(term);
                      const hit = index >= 0;
                      if (hit) {
                        const before = entry.valueKey.substring(0, index);
                        const match = entry.valueKey.substring(index, index + term.length);
                        const after = entry.valueKey.substring(index + term.length);
                        entry.value = `${before}<span style="background: #E3D67F">${match}</span>${after}`;
                      } else {
                        entry.value = entry.valueKey;
                      }
                      return hit;
                    });
                  }));
              })
            );

          })
        );
      })
    );

    this.subscriptions.push(
      this.router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe(() => {
        this.store.dispatch(new fromDialog.CloseDialogAction());
      })
    );
  }

  public getFacetRangeValue(facet: Facet, entry: SdrFacetEntry): string {
    return getFacetFilterLabel(facet, entry);
  }

  public getQueryParams(params: Params, facet: Facet, entry: SdrFacetEntry): Params {
    const queryParams: Params = Object.assign({}, params);
    switch (facet.type) {
      case FacetType.DATE_YEAR:
        queryParams[`${this.field}.filter`] = buildDateYearFilterValue(entry);
        queryParams[`${this.field}.opKey`] = OpKey.BETWEEN;
        break;
      case FacetType.NUMBER_RANGE:
        queryParams[`${this.field}.filter`] = buildNumberRangeFilterValue(facet, entry);
        queryParams[`${this.field}.opKey`] = OpKey.BETWEEN;
        break;
      default:
        queryParams[`${this.field}.filter`] = entry.value;
        queryParams[`${this.field}.opKey`] = OpKey.EQUALS;
        break;
    }
    queryParams[`${this.field}.pageNumber`] = 1;
    if (queryParams.filters && queryParams.filters.length > 0) {
      if (queryParams.filters.indexOf(this.field) < 0) {
        queryParams.filters += `,${facet.field}`;
      }
    } else {
      queryParams.filters = facet.field;
    }
    return queryParams;
  }

}
