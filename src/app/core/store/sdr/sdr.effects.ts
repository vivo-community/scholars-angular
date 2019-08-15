import { Injectable, Injector } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { combineLatest, defer, Observable, scheduled } from 'rxjs';
import { asap } from 'rxjs/internal/scheduler/asap';
import { map, switchMap, catchError, withLatestFrom, skipWhile, take, filter, mergeMap } from 'rxjs/operators';

import { AlertService } from '../../service/alert.service';
import { DialogService } from '../../service/dialog.service';

import { AppState } from '../';
import { StompState } from '../stomp/stomp.reducer';
import { CustomRouterState } from '../router/router.reducer';

import { AbstractSdrRepo } from '../../model/sdr/repo/abstract-sdr-repo';

import { SdrResource, SdrCollection, SdrFacet, SdrFacetEntry, Count } from '../../model/sdr';
import { SidebarMenu, SidebarSection, SidebarItem, SidebarItemType } from '../../model/sidebar';
import { SolrDocument } from '../../model/discovery';
import { Facet, DiscoveryView, DirectoryView, FacetType } from '../../model/view';

import { injectable, repos } from '../../model/repos';

import { createSdrRequest } from '../../../shared/utilities/discovery.utility';

import { selectAllResources } from './';
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
        private translate: TranslateService
    ) {
        this.repos = new Map<string, AbstractSdrRepo<SdrResource>>();
        this.injectRepos();
    }

    // TODO: alerts should be in dialog location if a dialog is opened

    @Effect() getAll = this.actions.pipe(
        ofType(...this.buildActions(fromSdr.SdrActionTypes.GET_ALL)),
        mergeMap((action: fromSdr.GetAllResourcesAction) => this.repos.get(action.name).getAll().pipe(
            map((collection: SdrCollection) => new fromSdr.GetAllResourcesSuccessAction(action.name, { collection })),
            catchError((response) => scheduled([new fromSdr.GetAllResourcesFailureAction(action.name, { response })], asap))
        ))
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
        switchMap((action: fromSdr.GetOneResourceAction) => this.repos.get(action.name).getOne(action.payload.id).pipe(
            map((document: SolrDocument) => new fromSdr.GetOneResourceSuccessAction(action.name, { document })),
            catchError((response) => scheduled([new fromSdr.GetOneResourceFailureAction(action.name, { response })], asap))
        ))
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
        mergeMap((action: fromSdr.FindByIdInResourceAction) => this.repos.get(action.name).findByIdIn(action.payload.ids).pipe(
            map((collection: SdrCollection) => new fromSdr.FindByIdInResourceSuccessAction(action.name, { collection })),
            catchError((response) => scheduled([new fromSdr.FindByIdInResourceFailureAction(action.name, { response })], asap))
        ))
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
        switchMap((action: fromSdr.FindByTypesInResourceAction) => this.repos.get(action.name).findByTypesIn(action.payload.types).pipe(
            map((document: SolrDocument) => new fromSdr.FindByTypesInResourceSuccessAction(action.name, { document })),
            catchError((response) => scheduled([new fromSdr.FindByTypesInResourceFailureAction(action.name, { response })], asap))
        ))
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
            const collection = action.payload.collection;
            const document = action.payload.document;
            const ids = document[field].map((property) => property.id);
            return this.repos.get(collection).findByIdIn(ids).pipe(
                map((resources: SdrCollection) => new fromSdr.FetchLazyReferenceSuccessAction(action.name, { document, collection, field, resources })),
                catchError((response) => scheduled([new fromSdr.FetchLazyReferenceFailureAction(action.name, { response })], asap))
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
            this.repos.get(action.name).page(action.payload.request).pipe(
                map((collection: SdrCollection) => new fromSdr.PageResourcesSuccessAction(action.name, { collection })),
                catchError((response) => scheduled([new fromSdr.PageResourcesFailureAction(action.name, { response })], asap))
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
            this.repos.get(action.name).search(action.payload.request).pipe(
                map((collection: SdrCollection) => new fromSdr.SearchResourcesSuccessAction(action.name, { collection })),
                catchError((response) => scheduled([new fromSdr.SearchResourcesFailureAction(action.name, { response })], asap))
            )
        )
    );

    @Effect({ dispatch: false }) searchSuccess = this.actions.pipe(
        ofType(...this.buildActions(fromSdr.SdrActionTypes.SEARCH_SUCCESS)),
        switchMap((action: fromSdr.SearchResourcesSuccessAction) => combineLatest([
            scheduled([action], asap),
            this.store.pipe(select(selectRouterState)),
            this.store.pipe(
                select(selectAllResources('directoryViews')),
                filter((views: DirectoryView[]) => views.length !== 0)
            ),
            this.store.pipe(
                select(selectAllResources('discoveryViews')),
                filter((views: DiscoveryView[]) => views.length !== 0)
            ),
            this.store.pipe(
                select(selectIsStompConnected),
                skipWhile((connected: boolean) => !connected),
                take(1)
            )
        ])),
        withLatestFrom(this.store),
        map(([combination, store]) => this.searchSuccessHandler(combination[0], combination[1].state, store))
    );

    @Effect() searchFailure = this.actions.pipe(
        ofType(...this.buildActions(fromSdr.SdrActionTypes.SEARCH_FAILURE)),
        map((action: fromSdr.SearchResourcesFailureAction) => this.alert.searchFailureAlert(action.payload))
    );

    @Effect() count = this.actions.pipe(
        ofType(...this.buildActions(fromSdr.SdrActionTypes.COUNT)),
        mergeMap((action: fromSdr.CountResourcesAction) => this.repos.get(action.name).count(action.payload.request).pipe(
            map((count: Count) => new fromSdr.CountResourcesSuccessAction(action.name, { count })),
            catchError((response) => scheduled([new fromSdr.CountResourcesFailureAction(action.name, { response })], asap))
        ))
    );

    @Effect() countFailure = this.actions.pipe(
        ofType(...this.buildActions(fromSdr.SdrActionTypes.COUNT_FAILURE)),
        map((action: fromSdr.CountResourcesFailureAction) => this.alert.countFailureAlert(action.payload))
    );

    @Effect() recentlyUpdated = this.actions.pipe(
        ofType(...this.buildActions(fromSdr.SdrActionTypes.RECENTLY_UPDATED)),
        mergeMap((action: fromSdr.RecentlyUpdatedResourcesAction) => this.repos.get(action.name).recentlyUpdated(action.payload.limit).pipe(
            map((recentlyUpdated: SdrResource[]) => new fromSdr.RecentlyUpdatedResourcesSuccessAction(action.name, { recentlyUpdated })),
            catchError((response) => scheduled([new fromSdr.RecentlyUpdatedResourcesFailureAction(action.name, { response })], asap))
        ))
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
            this.repos.get(action.name).post(action.payload.resource).pipe(
                map((resource: SdrResource) => new fromSdr.PostResourceSuccessAction(action.name, { resource })),
                catchError((response) => scheduled([new fromSdr.PostResourceFailureAction(action.name, { response })], asap))
            )
        )
    );

    @Effect() postSuccess = this.actions.pipe(
        ofType(...this.buildActions(fromSdr.SdrActionTypes.POST_SUCCESS)),
        switchMap((action: fromSdr.PostResourceSuccessAction) => [
            new fromDialog.CloseDialogAction(),
            this.alert.postSuccessAlert(action)
        ])
    );

    @Effect() postFailure = this.actions.pipe(
        ofType(...this.buildActions(fromSdr.SdrActionTypes.POST_FAILURE)),
        map((action: fromSdr.PostResourceFailureAction) => this.alert.postFailureAlert(action.payload))
    );

    @Effect() put = this.actions.pipe(
        ofType(...this.buildActions(fromSdr.SdrActionTypes.PUT)),
        switchMap((action: fromSdr.PutResourceAction) =>
            this.repos.get(action.name).put(action.payload.resource).pipe(
                map((resource: SdrResource) => new fromSdr.PutResourceSuccessAction(action.name, { resource })),
                catchError((response) => scheduled([new fromSdr.PutResourceFailureAction(action.name, { response })], asap))
            )
        )
    );

    @Effect() putSuccess = this.actions.pipe(
        ofType(...this.buildActions(fromSdr.SdrActionTypes.PUT_SUCCESS)),
        switchMap((action: fromSdr.PutResourceSuccessAction) => [
            new fromDialog.CloseDialogAction(),
            this.alert.putSuccessAlert(action)
        ])
    );

    @Effect() putFailure = this.actions.pipe(
        ofType(...this.buildActions(fromSdr.SdrActionTypes.PUT_FAILURE)),
        map((action: fromSdr.PutResourceFailureAction) => this.alert.putFailureAlert(action.payload))
    );

    @Effect() patch = this.actions.pipe(
        ofType(...this.buildActions(fromSdr.SdrActionTypes.PATCH)),
        switchMap((action: fromSdr.PatchResourceAction) =>
            this.repos.get(action.name).patch(action.payload.resource).pipe(
                map((resource: SdrResource) => new fromSdr.PatchResourceSuccessAction(action.name, { resource })),
                catchError((response) => scheduled([new fromSdr.PatchResourceFailureAction(action.name, { response })], asap))
            )
        )
    );

    @Effect() patchSuccess = this.actions.pipe(
        ofType(...this.buildActions(fromSdr.SdrActionTypes.PATCH_SUCCESS)),
        switchMap((action: fromSdr.PatchResourceSuccessAction) => [
            new fromDialog.CloseDialogAction(),
            this.alert.patchSuccessAlert(action)
        ])
    );

    @Effect() patchFailure = this.actions.pipe(
        ofType(...this.buildActions(fromSdr.SdrActionTypes.PATCH_FAILURE)),
        map((action: fromSdr.PatchResourceFailureAction) => this.alert.patchFailureAlert(action.payload))
    );

    @Effect() delete = this.actions.pipe(
        ofType(...this.buildActions(fromSdr.SdrActionTypes.DELETE)),
        switchMap((action: fromSdr.DeleteResourceAction) =>
            this.repos.get(action.name).delete(action.payload.id).pipe(
                map(() => new fromSdr.DeleteResourceSuccessAction(action.name)),
                catchError((response) => scheduled([new fromSdr.DeleteResourceFailureAction(action.name, { response })], asap))
            )
        )
    );

    @Effect() deleteSuccess = this.actions.pipe(
        ofType(...this.buildActions(fromSdr.SdrActionTypes.DELETE_SUCCESS)),
        switchMap((action: fromSdr.DeleteResourceSuccessAction) => [
            new fromDialog.CloseDialogAction(),
            this.alert.deleteSuccessAlert(action)
        ])
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
            parent: this.injector
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
            if (repos.hasOwnProperty(name) && !exclude.includes(name)) {
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
            )
        ]);
    }

    private subscribeToResourceQueue(name: string, stomp: StompState): void {
        if (!stomp.subscriptions.has(`/queue/${name}`)) {
            this.store.dispatch(new fromStomp.SubscribeAction({
                channel: `/queue/${name}`,
                handle: (frame: any) => {
                    // TODO: conditionally reload all
                    if (frame.command === 'MESSAGE') {
                        console.log(frame);
                    }
                }
            }));
        }
    }

    private searchSuccessHandler(action: fromSdr.SearchResourcesSuccessAction, routerState: CustomRouterState, store: AppState): void {
        if (routerState.queryParams.collection) {

            let viewFacets: Facet[] = [];

            if (routerState.url.startsWith('/directory')) {
                viewFacets = store['directoryViews'].entities[routerState.params.view].facets;
            } else if (routerState.url.startsWith('/discovery')) {
                viewFacets = store['discoveryViews'].entities[routerState.params.view].facets;
            }

            const sdrFacets: SdrFacet[] = action.payload.collection.facets;

            const sidebarMenu: SidebarMenu = {
                sections: []
            };

            this.store.dispatch(new fromSidebar.LoadSidebarAction({ menu: sidebarMenu }));

            viewFacets.filter((viewFacet: Facet) => !viewFacet.hidden).forEach((viewFacet: Facet) => {
                const sdrFacet = sdrFacets.find((sf: SdrFacet) => sf.field === viewFacet.field);
                if (sdrFacet) {
                    const sidebarSection: SidebarSection = {
                        title: scheduled([viewFacet.name], asap),
                        items: [],
                        collapsible: true,
                        collapsed: viewFacet.collapsed
                    };

                    sidebarMenu.sections.push(sidebarSection);

                    sdrFacet.entries.content.filter((facetEntry: SdrFacetEntry) => facetEntry.value.length > 0).forEach((facetEntry: SdrFacetEntry) => {
                        let selected = false;

                        const requestFacet = routerState.queryParams.facets.split(',').find((rf: string) => rf === sdrFacet.field);

                        if (requestFacet && routerState.queryParams[`${requestFacet}.filter`] !== undefined) {
                            if (viewFacet.type === FacetType.DATE_YEAR) {
                                const date = new Date(facetEntry.value);
                                const year = date.getUTCFullYear();
                                if (routerState.queryParams[`${requestFacet}.filter`] === `[${year} TO ${year + 1}]`) {
                                    selected = true;
                                }
                            } else {
                                if (routerState.queryParams[`${requestFacet}.filter`] === facetEntry.value) {
                                    selected = true;
                                }
                            }
                        }

                        const sidebarItem: SidebarItem = {
                            type: SidebarItemType.FACET,
                            label: scheduled([facetEntry.value], asap),
                            facet: viewFacet,
                            selected: selected,
                            parenthetical: facetEntry.count,
                            route: [],
                            queryParams: {},
                        };

                        if (viewFacet.type === FacetType.DATE_YEAR) {
                            const date = new Date(facetEntry.value);
                            const year = date.getUTCFullYear();
                            sidebarItem.queryParams[`${sdrFacet.field}.filter`] = !selected ? `[${year} TO ${year + 1}]` : undefined;
                        } else {
                            sidebarItem.queryParams[`${sdrFacet.field}.filter`] = !selected ? facetEntry.value : undefined;
                        }

                        sidebarItem.queryParams.page = 1;

                        if (selected) {
                            sidebarSection.collapsed = false;
                        }

                        sidebarSection.items.push(sidebarItem);
                    });

                    if (sdrFacet.entries.page.totalPages > 1) {
                        sidebarSection.items.push({
                            type: SidebarItemType.ACTION,
                            action: this.dialog.facetEntriesDialog(viewFacet.name, sdrFacet.field),
                            label: this.translate.get('SHARED.SIDEBAR.ACTION.MORE'),
                            classes: 'font-weight-bold'
                        });
                    }
                }
            });
        }
        this.subscribeToResourceQueue(action.name, store.stomp);
    }

}
