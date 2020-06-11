import { Injectable, Injector } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { combineLatest, defer, Observable, scheduled } from 'rxjs';
import { asap } from 'rxjs/internal/scheduler/asap';
import { catchError, filter, map, mergeMap, skipWhile, switchMap, take, withLatestFrom } from 'rxjs/operators';

import { AlertService } from '../../service/alert.service';
import { DialogService } from '../../service/dialog.service';
import { StatsService } from '../../service/stats.service';

import { AppState } from '../';
import { StompState } from '../stomp/stomp.reducer';
import { CustomRouterState } from '../router/router.reducer';

import { AbstractSdrRepo } from '../../model/sdr/repo/abstract-sdr-repo';

import { SdrResource, SdrCollection, SdrFacet, SdrFacetEntry, Count } from '../../model/sdr';
import { SidebarMenu, SidebarSection, SidebarItem, SidebarItemType } from '../../model/sidebar';
import { SolrDocument } from '../../model/discovery';
import { Facet, DiscoveryView, DirectoryView, FacetType, OpKey } from '../../model/view';

import { injectable, repos } from '../../model/repos';

import { createSdrRequest } from '../../../shared/utilities/discovery.utility';

import { selectSdrState } from './';
import { SdrState } from './sdr.reducer';
import { selectRouterState } from '../router';
import { selectIsStompConnected, selectStompState } from '../stomp';

import * as fromDialog from '../dialog/dialog.actions';
import * as fromRouter from '../router/router.actions';
import * as fromStomp from '../stomp/stomp.actions';
import * as fromSdr from './sdr.actions';
import * as fromSidebar from '../sidebar/sidebar.actions';

@Injectable()
export class SdrEffects {

  private repos: Map<string, AbstractSdrRepo<SdrResource>>;

  constructor(
    private actions: Actions,
    private injector: Injector,
    private store: Store<AppState>,
    private alert: AlertService,
    private dialog: DialogService,
    private stats: StatsService,
    private translate: TranslateService
  ) {
    this.repos = new Map<string, AbstractSdrRepo<SdrResource>>();
    this.injectRepos();
  }

  // TODO: alerts should be in dialog location if a dialog is opened

  @Effect() getAll = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.GET_ALL)),
    mergeMap((action: fromSdr.GetAllResourcesAction) =>
      this.repos
        .get(action.name)
        .getAll()
        .pipe(
          map(
            (collection: SdrCollection) =>
              new fromSdr.GetAllResourcesSuccessAction(action.name, {
                collection,
              })
          ),
          catchError((response) =>
            scheduled(
              [
                new fromSdr.GetAllResourcesFailureAction(action.name, {
                  response,
                }),
              ],
              asap
            )
          )
        )
    )
  );

  @Effect({ dispatch: false }) getAllSuccess = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.GET_ALL_SUCCESS)),
    switchMap((action: fromSdr.GetAllResourcesSuccessAction) => this.waitForStompConnection(action.name)),
    withLatestFrom(this.store.pipe(select(selectStompState))),
    map(([combination, stomp]) => this.subscribeToResourceQueue(combination[0], stomp))
  );

  @Effect() getAllFailure = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.GET_ALL_FAILURE)),
    map((action: fromSdr.GetAllResourcesFailureAction) => this.alert.getAllFailureAlert(action.payload))
  );

  @Effect() getOne = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.GET_ONE)),
    switchMap((action: fromSdr.GetOneResourceAction) =>
      this.repos
        .get(action.name)
        .getOne(action.payload.id)
        .pipe(
          map((document: SolrDocument) => new fromSdr.GetOneResourceSuccessAction(action.name, { document })),
          catchError((response) =>
            scheduled(
              [
                new fromSdr.GetOneResourceFailureAction(action.name, {
                  response,
                }),
              ],
              asap
            )
          )
        )
    )
  );

  @Effect({ dispatch: false }) getOneSuccess = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.GET_ONE_SUCCESS)),
    switchMap((action: fromSdr.GetOneResourceSuccessAction) => this.waitForStompConnection(action.name)),
    withLatestFrom(this.store.pipe(select(selectStompState))),
    map(([combination, stomp]) => this.subscribeToResourceQueue(combination[0], stomp))
  );

  @Effect() getOneFailure = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.GET_ONE_FAILURE)),
    map((action: fromSdr.GetOneResourceFailureAction) => this.alert.getOneFailureAlert(action.payload))
  );

  @Effect() findByIdIn = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.FIND_BY_ID_IN)),
    mergeMap((action: fromSdr.FindByIdInResourceAction) =>
      this.repos
        .get(action.name)
        .findByIdIn(action.payload.ids)
        .pipe(
          map(
            (collection: SdrCollection) =>
              new fromSdr.FindByIdInResourceSuccessAction(action.name, {
                collection,
              })
          ),
          catchError((response) =>
            scheduled(
              [
                new fromSdr.FindByIdInResourceFailureAction(action.name, {
                  response,
                }),
              ],
              asap
            )
          )
        )
    )
  );

  @Effect({ dispatch: false }) findByIdInSuccess = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.FIND_BY_ID_IN_SUCCESS)),
    switchMap((action: fromSdr.FindByIdInResourceSuccessAction) => this.waitForStompConnection(action.name)),
    withLatestFrom(this.store.pipe(select(selectStompState))),
    map(([combination, stomp]) => this.subscribeToResourceQueue(combination[0], stomp))
  );

  @Effect() gfindByIdInFailure = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.FIND_BY_ID_IN_FAILURE)),
    map((action: fromSdr.FindByIdInResourceFailureAction) => this.alert.findByIdInFailureAlert(action.payload))
  );

  @Effect() findByTypesIn = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.FIND_BY_TYPES_IN)),
    switchMap((action: fromSdr.FindByTypesInResourceAction) =>
      this.repos
        .get(action.name)
        .findByTypesIn(action.payload.types)
        .pipe(
          map(
            (document: SolrDocument) =>
              new fromSdr.FindByTypesInResourceSuccessAction(action.name, {
                document,
              })
          ),
          catchError((response) =>
            scheduled(
              [
                new fromSdr.FindByTypesInResourceFailureAction(action.name, {
                  response,
                }),
              ],
              asap
            )
          )
        )
    )
  );

  @Effect({ dispatch: false }) findByTypesInSuccess = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.FIND_BY_TYPES_IN_SUCCESS)),
    switchMap((action: fromSdr.FindByTypesInResourceSuccessAction) => this.waitForStompConnection(action.name)),
    withLatestFrom(this.store.pipe(select(selectStompState))),
    map(([combination, stomp]) => this.subscribeToResourceQueue(combination[0], stomp))
  );

  @Effect() findByTypesInFailure = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.FIND_BY_TYPES_IN_FAILURE)),
    map((action: fromSdr.FindByTypesInResourceFailureAction) => this.alert.findByTypesInFailureAlert(action.payload))
  );

  @Effect() fetchLazyReference = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.FETCH_LAZY_REFERENCE)),
    switchMap((action: fromSdr.FetchLazyReferenceAction) => {
      const field = action.payload.field;
      const document = action.payload.document;
      const ids = Array.isArray(document[field]) ? document[field].map((property) => property.id) : [document[field].id];
      return this.repos
        .get('individual')
        .findByIdIn(ids)
        .pipe(
          map(
            (resources: SdrCollection) =>
              new fromSdr.FetchLazyReferenceSuccessAction(action.name, {
                document,
                field,
                resources,
              })
          ),
          catchError((response) =>
            scheduled(
              [
                new fromSdr.FetchLazyReferenceFailureAction(action.name, {
                  response,
                }),
              ],
              asap
            )
          )
        );
    })
  );

  @Effect() fetchLazyReferenceFailure = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.FETCH_LAZY_REFERENCE_FAILURE)),
    map((action: fromSdr.FetchLazyReferenceFailureAction) => this.alert.fetchLazyRefernceFailureAlert(action.payload))
  );

  @Effect() page = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.PAGE)),
    switchMap((action: fromSdr.PageResourcesAction) =>
      this.repos
        .get(action.name)
        .page(action.payload.request)
        .pipe(
          map(
            (collection: SdrCollection) =>
              new fromSdr.PageResourcesSuccessAction(action.name, {
                collection,
              })
          ),
          catchError((response) =>
            scheduled(
              [
                new fromSdr.PageResourcesFailureAction(action.name, {
                  response,
                }),
              ],
              asap
            )
          )
        )
    )
  );

  @Effect({ dispatch: false }) pageSuccess = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.PAGE_SUCCESS)),
    switchMap((action: fromSdr.PageResourcesSuccessAction) => this.waitForStompConnection(action.name)),
    withLatestFrom(this.store.pipe(select(selectStompState))),
    map(([combination, stomp]) => this.subscribeToResourceQueue(combination[0], stomp))
  );

  @Effect() pageFailure = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.PAGE_FAILURE)),
    map((action: fromSdr.PageResourcesFailureAction) => this.alert.pageFailureAlert(action.payload))
  );

  @Effect() search = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.SEARCH)),
    switchMap((action: fromSdr.SearchResourcesAction) =>
      this.repos
        .get(action.name)
        .search(action.payload.request)
        .pipe(
          map(
            (collection: SdrCollection) =>
              new fromSdr.SearchResourcesSuccessAction(action.name, {
                collection,
              })
          ),
          catchError((response) =>
            scheduled(
              [
                new fromSdr.SearchResourcesFailureAction(action.name, {
                  response,
                }),
              ],
              asap
            )
          )
        )
    )
  );

  @Effect({ dispatch: false }) searchSuccess = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.SEARCH_SUCCESS)),
    switchMap((action: fromSdr.SearchResourcesSuccessAction) =>
      combineLatest([
        scheduled([action], asap),
        this.store.pipe(
          select(selectRouterState),
          take(1)
        ),
        this.store.pipe(
          select(selectSdrState('directoryViews')),
          filter((directory: SdrState<DirectoryView>) => directory !== undefined)
        ),
        this.store.pipe(
          select(selectSdrState('discoveryViews')),
          filter((discovery: SdrState<DiscoveryView>) => discovery !== undefined)
        )
      ])
    ),
    map((latest) => {
      return this.searchSuccessHandler({
        action: latest[0],
        route: latest[1].state,
        directory: latest[2] as SdrState<DirectoryView>,
        discovery: latest[3] as SdrState<DiscoveryView>
      });
    })
  );

  @Effect() searchFailure = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.SEARCH_FAILURE)),
    map((action: fromSdr.SearchResourcesFailureAction) => this.alert.searchFailureAlert(action.payload))
  );

  @Effect() count = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.COUNT)),
    mergeMap((action: fromSdr.CountResourcesAction) =>
      this.repos
        .get(action.name)
        .count(action.payload.request)
        .pipe(
          map(
            (count: Count) =>
              new fromSdr.CountResourcesSuccessAction(action.name, {
                label: action.payload.label,
                count,
              })
          ),
          catchError((response) =>
            scheduled(
              [
                new fromSdr.CountResourcesFailureAction(action.name, {
                  label: action.payload.label,
                  response,
                }),
              ],
              asap
            )
          )
        )
    )
  );

  @Effect() countFailure = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.COUNT_FAILURE)),
    map((action: fromSdr.CountResourcesFailureAction) => this.alert.countFailureAlert(action.payload))
  );

  @Effect() recentlyUpdated = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.RECENTLY_UPDATED)),
    mergeMap((action: fromSdr.RecentlyUpdatedResourcesAction) =>
      this.repos
        .get(action.name)
        .recentlyUpdated(action.payload.limit, action.payload.filters)
        .pipe(
          map(
            (recentlyUpdated: SdrResource[]) =>
              new fromSdr.RecentlyUpdatedResourcesSuccessAction(action.name, {
                recentlyUpdated,
              })
          ),
          catchError((response) =>
            scheduled(
              [
                new fromSdr.RecentlyUpdatedResourcesFailureAction(action.name, {
                  response,
                }),
              ],
              asap
            )
          )
        )
    )
  );

  @Effect() getRecentlyUpdatedFailure = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.RECENTLY_UPDATED_FAILURE)),
    map((action: fromSdr.RecentlyUpdatedResourcesFailureAction) => this.alert.recentlyUpdatedFailureAlert(action.payload))
  );

  @Effect() clearResourceSubscription = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.CLEAR)),
    map((action: fromSdr.PageResourcesSuccessAction) => new fromStomp.UnsubscribeAction({ channel: `/queue/${action.name}` }))
  );

  @Effect() post = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.POST)),
    switchMap((action: fromSdr.PostResourceAction) =>
      this.repos
        .get(action.name)
        .post(action.payload.resource)
        .pipe(
          map((resource: SdrResource) => new fromSdr.PostResourceSuccessAction(action.name, { resource })),
          catchError((response) =>
            scheduled(
              [
                new fromSdr.PostResourceFailureAction(action.name, {
                  response,
                }),
              ],
              asap
            )
          )
        )
    )
  );

  @Effect() postSuccess = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.POST_SUCCESS)),
    switchMap((action: fromSdr.PostResourceSuccessAction) => [new fromDialog.CloseDialogAction(), this.alert.postSuccessAlert(action)])
  );

  @Effect() postFailure = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.POST_FAILURE)),
    map((action: fromSdr.PostResourceFailureAction) => this.alert.postFailureAlert(action.payload))
  );

  @Effect() put = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.PUT)),
    switchMap((action: fromSdr.PutResourceAction) =>
      this.repos
        .get(action.name)
        .put(action.payload.resource)
        .pipe(
          map((resource: SdrResource) => new fromSdr.PutResourceSuccessAction(action.name, { resource })),
          catchError((response) => scheduled([new fromSdr.PutResourceFailureAction(action.name, { response })], asap))
        )
    )
  );

  @Effect() putSuccess = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.PUT_SUCCESS)),
    switchMap((action: fromSdr.PutResourceSuccessAction) => [new fromDialog.CloseDialogAction(), this.alert.putSuccessAlert(action)])
  );

  @Effect() putFailure = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.PUT_FAILURE)),
    map((action: fromSdr.PutResourceFailureAction) => this.alert.putFailureAlert(action.payload))
  );

  @Effect() patch = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.PATCH)),
    switchMap((action: fromSdr.PatchResourceAction) =>
      this.repos
        .get(action.name)
        .patch(action.payload.resource)
        .pipe(
          map((resource: SdrResource) => new fromSdr.PatchResourceSuccessAction(action.name, { resource })),
          catchError((response) =>
            scheduled(
              [
                new fromSdr.PatchResourceFailureAction(action.name, {
                  response,
                }),
              ],
              asap
            )
          )
        )
    )
  );

  @Effect() patchSuccess = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.PATCH_SUCCESS)),
    switchMap((action: fromSdr.PatchResourceSuccessAction) => [new fromDialog.CloseDialogAction(), this.alert.patchSuccessAlert(action)])
  );

  @Effect() patchFailure = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.PATCH_FAILURE)),
    map((action: fromSdr.PatchResourceFailureAction) => this.alert.patchFailureAlert(action.payload))
  );

  @Effect() delete = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.DELETE)),
    switchMap((action: fromSdr.DeleteResourceAction) =>
      this.repos
        .get(action.name)
        .delete(action.payload.id)
        .pipe(
          map(() => new fromSdr.DeleteResourceSuccessAction(action.name)),
          catchError((response) =>
            scheduled(
              [
                new fromSdr.DeleteResourceFailureAction(action.name, {
                  response,
                }),
              ],
              asap
            )
          )
        )
    )
  );

  @Effect() deleteSuccess = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.DELETE_SUCCESS)),
    switchMap((action: fromSdr.DeleteResourceSuccessAction) => [new fromDialog.CloseDialogAction(), this.alert.deleteSuccessAlert(action)])
  );

  @Effect() deleteFailure = this.actions.pipe(
    ofType(...this.buildActions(fromSdr.SdrActionTypes.DELETE_FAILURE)),
    map((action: fromSdr.DeleteResourceFailureAction) => this.alert.deleteFailureAlert(action.payload))
  );

  @Effect({ dispatch: false }) navigation = this.actions.pipe(
    ofType(fromRouter.RouterActionTypes.CHANGED),
    withLatestFrom(this.store.pipe(select(selectRouterState))),
    map(([action, router]) => {
      let collection = router.state.data.collection;
      if (collection === undefined) {
        collection = router.state.queryParams.collection;
      }
      if (collection) {
        const request = createSdrRequest(router.state);
        if (router.state.url.startsWith('/directory') || router.state.url.startsWith('/discovery')) {
          this.store.dispatch(new fromSdr.SearchResourcesAction(collection, { request }));
        } else {
          this.store.dispatch(new fromSdr.PageResourcesAction(collection, { request }));
        }
      }
    })
  );

  @Effect() initViews = defer(() => scheduled([
    new fromSdr.GetAllResourcesAction('directoryViews'),
    new fromSdr.GetAllResourcesAction('discoveryViews')
  ], asap));

  private injectRepos(): void {
    const injector = Injector.create({
      providers: injectable,
      parent: this.injector,
    });
    for (const name in repos) {
      if (repos.hasOwnProperty(name)) {
        this.repos.set(name, injector.get<AbstractSdrRepo<SdrResource>>(repos[name]));
      }
    }
  }

  private buildActions(actionType: fromSdr.SdrActionTypes, exclude: string[] = []): string[] {
    const loadActions = [];
    for (const name in repos) {
      if (repos.hasOwnProperty(name) && exclude.indexOf(name) < 0) {
        loadActions.push(fromSdr.getSdrAction(actionType, name));
      }
    }
    return loadActions;
  }

  private waitForStompConnection(name: string): Observable<[string, boolean]> {
    return combineLatest([
      scheduled([name], asap),
      this.store.pipe(
        select(selectIsStompConnected),
        skipWhile((connected: boolean) => !connected),
        take(1)
      ),
    ]);
  }

  private subscribeToResourceQueue(name: string, stomp: StompState): void {
    if (!stomp.subscriptions.has(`/queue/${name}`)) {
      this.store.dispatch(
        new fromStomp.SubscribeAction({
          channel: `/queue/${name}`,
          handle: (frame: any) => {
            // TODO: conditionally reload all
            if (frame.command === 'MESSAGE') {
              console.log(frame);
            }
          },
        })
      );
    }
  }

  private searchSuccessHandler(results: {
    action: fromSdr.SearchResourcesSuccessAction,
    route: CustomRouterState,
    directory: SdrState<DirectoryView>,
    discovery: SdrState<DiscoveryView>
  }): void {
    const  { action, route, directory, discovery } = results;
    if (route.queryParams.collection) {
      this.stats.collect(route.queryParams).toPromise().then((data: any) => {
        if (data) {
          // tslint:disable-next-line: no-console
          console.info('collected stats', data);
        }
      }).catch((error: any) => {
        console.error(error);
      });

      // tslint:disable-next-line: no-string-literal
      const viewFacets: Facet[] = route.url.startsWith('/directory') ? directory.entities[route.params.view].facets : discovery.entities[route.params.view].facets;

      const sdrFacets: SdrFacet[] = action.payload.collection.facets;

      const sidebarMenu: SidebarMenu = {
        sections: [],
      };

      const expanded = route.queryParams.expanded ? route.queryParams.expanded.split(',') : [];

      viewFacets
        .filter((viewFacet: Facet) => !viewFacet.hidden)
        .forEach((viewFacet: Facet) => {

          const sdrFacet = sdrFacets.find((sf: SdrFacet) => sf.field === viewFacet.field);

          if (sdrFacet) {
            const sidebarSection: SidebarSection = {
              title: viewFacet.name,
              items: [],
              collapsible: true,
              collapsed: expanded.indexOf(encodeURIComponent(viewFacet.name)) >= 0 ? false : viewFacet.collapsed,
            };

            sidebarMenu.sections.push(sidebarSection);

            if (viewFacet.type === FacetType.RANGE_SLIDER) {

              const requestFilter = route.queryParams.filters.split(',').find((rf: string) => rf === sdrFacet.field);

              const rangeOptions = {
                floor: viewFacet.rangeMin,
                ceil: viewFacet.rangeMax
              };
              const rangeValues = {
                from: viewFacet.rangeMin,
                to: viewFacet.rangeMax
              };

              if (requestFilter) {
                const filterValue = route.queryParams[`${requestFilter}.filter`];
                if (filterValue.startsWith('[') && filterValue.indexOf('TO') >= 0 && filterValue.endsWith(']')) {
                  const range = filterValue.substring(1, filterValue.length - 1).split(' TO ');
                  rangeValues.from = range[0];
                  rangeValues.to = range[1];
                }
                sidebarSection.collapsed = false;
              }

              const sidebarItem: SidebarItem = {
                type: SidebarItemType.RANGE_SLIDER,
                label: '',
                facet: viewFacet,
                route: [],
                queryParams: Object.assign({}, route.queryParams),
                rangeOptions,
                rangeValues
              };
              sidebarItem.queryParams[`${sdrFacet.field}.filter`] = `[${sidebarItem.rangeValues.from} TO ${sidebarItem.rangeValues.to}]`;
              sidebarItem.queryParams[`${sdrFacet.field}.opKey`] = OpKey.BETWEEN;
              sidebarSection.items.push(sidebarItem);
            }

            sdrFacet.entries.content
              .filter((facetEntry: SdrFacetEntry) => facetEntry.value.length > 0)
              .forEach((facetEntry: SdrFacetEntry) => {
                let selected = false;

                const requestFacet = route.queryParams.facets.split(',').find((rf: string) => rf === sdrFacet.field);

                if (requestFacet && route.queryParams[`${requestFacet}.filter`] !== undefined) {
                  if (viewFacet.type === FacetType.DATE_YEAR) {
                    const date = new Date(facetEntry.value);
                    const year = date.getUTCFullYear();
                    const from = new Date(year, 0, 1, -6).toISOString();
                    const to = new Date(year + 1, 0, 1, -6).toISOString();
                    if (route.queryParams[`${requestFacet}.filter`] === `[${from} TO ${to}]`) {
                      selected = true;
                    }
                  } else {
                    if (route.queryParams[`${requestFacet}.filter`] === facetEntry.value) {
                      selected = true;
                    }
                  }
                }

                const sidebarItem: SidebarItem = {
                  type: SidebarItemType.FACET,
                  label: facetEntry.value,
                  facet: viewFacet,
                  selected,
                  parenthetical: facetEntry.count,
                  route: [],
                  queryParams: Object.assign({}, route.queryParams)
                };

                if (viewFacet.type === FacetType.DATE_YEAR) {
                  const date = new Date(facetEntry.value);
                  const year = date.getUTCFullYear();
                  const from = new Date(year, 0, 1, -6).toISOString();
                  const to = new Date(year + 1, 0, 1, -6).toISOString();
                  sidebarItem.queryParams[`${sdrFacet.field}.filter`] = !selected ? `[${from} TO ${to}]` : undefined;
                  sidebarItem.queryParams[`${sdrFacet.field}.opKey`] = OpKey.BETWEEN;
                } else {
                  sidebarItem.queryParams[`${sdrFacet.field}.filter`] = !selected ? facetEntry.value : undefined;
                  sidebarItem.queryParams[`${sdrFacet.field}.opKey`] = OpKey.EQUALS;
                }

                sidebarItem.queryParams.page = 1;

                if (selected) {
                  sidebarSection.collapsed = false;
                  if (sidebarItem.queryParams.filters && sidebarItem.queryParams.filters.indexOf(sdrFacet.field) >= 0) {
                    const filters = sidebarItem.queryParams.filters
                      .split(',')
                      .map((field) => field.trim())
                      .filter((field) => field !== sdrFacet.field);
                    if (filters.length > 0) {
                      sidebarItem.queryParams.filters = filters.join(',');
                    } else {
                      delete sidebarItem.queryParams.filters;
                    }
                  }
                } else {
                  if (sidebarItem.queryParams.filters) {
                    if (sidebarItem.queryParams.filters.indexOf(sdrFacet.field) < 0) {
                      sidebarItem.queryParams.filters += `,${sdrFacet.field}`;
                    }
                  } else {
                    sidebarItem.queryParams.filters = sdrFacet.field;
                  }
                }
                sidebarSection.items.push(sidebarItem);
              });

            if (sdrFacet.entries.page.totalPages > 1) {
              sidebarSection.items.push({
                type: SidebarItemType.ACTION,
                action: this.dialog.facetEntriesDialog(viewFacet.name, sdrFacet.field),
                label: this.translate.instant('SHARED.SIDEBAR.ACTION.MORE'),
                classes: 'font-weight-bold',
              });
            }
          }
        });

      if (action.payload.collection.page.totalElements === 0) {
        sidebarMenu.sections.push({
          title: this.translate.instant('SHARED.SIDEBAR.INFO.NO_RESULTS_LABEL', {
            view: route.params.view,
          }),
          items: [
            {
              type: SidebarItemType.INFO,
              label: this.translate.instant('SHARED.SIDEBAR.INFO.NO_RESULTS_TEXT', {
                view: route.params.view,
                query: route.queryParams.query,
              }),
              route: [],
              queryParams: {},
            },
          ],
          collapsible: false,
          collapsed: false,
        });
      }

      this.store.dispatch(new fromSidebar.LoadSidebarAction({ menu: sidebarMenu }));
    }
  }

}
