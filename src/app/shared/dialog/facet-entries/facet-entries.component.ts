import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Params, Router, NavigationStart } from '@angular/router';
import { Store, select } from '@ngrx/store';

import { scheduled, Subscription, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { queue } from 'rxjs/internal/scheduler/queue';

import { AppState } from '../../../core/store';
import { DialogButtonType, DialogControl } from '../../../core/model/dialog';
import { Facet, FacetType, CollectionView, OpKey } from '../../../core/model/view';
import { SdrFacet, SdrFacetEntry } from '../../../core/model/sdr';
import { CustomRouterState } from '../../../core/store/router/router.reducer';
import { selectRouterState } from '../../../core/store/router';
import { selectCollectionViewByName, selectResourcesFacets } from '../../../core/store/sdr';
import { createSdrRequest } from '../../utilities/discovery.utility';

import * as fromDialog from '../../../core/store/dialog/dialog.actions';
import * as fromSdr from '../../../core/store/sdr/sdr.actions';

@Component({
  selector: 'scholars-facet-entries',
  templateUrl: './facet-entries.component.html',
  styleUrls: ['./facet-entries.component.scss'],
})
export class FacetEntriesComponent implements OnDestroy, OnInit {

  @Input() name: string;

  @Input() field: string;

  public routerState: Observable<CustomRouterState>;

  public facet: Observable<Facet>;

  public sdrFacet: Observable<SdrFacet>;

  public routerLink = [];

  public dialog: DialogControl;

  private subscriptions: Subscription[];

  constructor(private router: Router, private store: Store<AppState>, private translate: TranslateService) {
    this.subscriptions = [];
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

    this.subscriptions.push(
      this.routerState.subscribe((routerState: CustomRouterState) => {
        this.dialog = {
          title: scheduled([this.name], queue),
          close: {
            type: DialogButtonType.OUTLINE_WARNING,
            label: this.translate.get('SHARED.DIALOG.FACET_ENTRIES.CANCEL'),
            action: () => {
              this.onPageChange(1, routerState);
              this.store.dispatch(new fromDialog.CloseDialogAction());
            },
            disabled: () => scheduled([false], queue),
          },
        };

        const viewCollection = routerState.url.startsWith('/directory') ? 'directoryViews' : 'discoveryViews';

        this.sdrFacet = this.store.pipe(
          select(selectResourcesFacets(routerState.queryParams.collection)),
          map((sdrFacets: SdrFacet[]) => sdrFacets.find((sdrFacet: SdrFacet) => sdrFacet.field === this.field))
        );

        this.facet = this.store.pipe(
          select(selectCollectionViewByName(viewCollection, routerState.params.view)),
          map((view: CollectionView) => view.facets.find((facet: Facet) => facet.name === this.name))
        );
      })
    );

    this.subscriptions.push(
      this.router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe(() => {
        this.store.dispatch(new fromDialog.CloseDialogAction());
      })
    );
  }

  public getQueryParams(facet: Facet, entry: SdrFacetEntry): Params {
    const queryParams: Params = {};
    if (facet.type === FacetType.DATE_YEAR) {
      const date = new Date(entry.value);
      const year = date.getUTCFullYear();
      queryParams[`${this.field}.filter`] = `[${year} TO ${year + 1}]`;
      queryParams[`${this.field}.opKey`] = OpKey.BETWEEN;
    } else {
      queryParams[`${this.field}.filter`] = entry.value;
      queryParams[`${this.field}.opKey`] = OpKey.EQUALS;
    }
    queryParams[`${this.field}.pageNumber`] = 1;
    if (!queryParams.filters) {
      queryParams.filters = facet.field;
    } else {
      queryParams.filters += `,${facet.field}`;
    }
    return queryParams;
  }

  public onPageChange(page: number, routerState: CustomRouterState): void {
    const queryParams: Params = {};
    queryParams[`${this.field}.pageNumber`] = page;
    const request = createSdrRequest({
      url: routerState.url,
      params: routerState.params,
      queryParams: Object.assign({}, routerState.queryParams, queryParams),
      data: {},
    });
    this.store.dispatch(
      new fromSdr.SearchResourcesAction(routerState.queryParams.collection, {
        request,
      })
    );
  }
}
