import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Params, Router, NavigationStart } from '@angular/router';
import { Store, select } from '@ngrx/store';

import { scheduled, Subscription, Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
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

import { createSdrRequest } from '../../utilities/discovery.utility';

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

  public dialog: DialogControl;

  private subscriptions: Subscription[];

  constructor(
    private router: Router,
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
              map((collection: SdrCollection) => collection.facets[0])
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

  public getQueryParams(params: Params, facet: Facet, entry: SdrFacetEntry): Params {
    const queryParams: Params = Object.assign({}, params);
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
