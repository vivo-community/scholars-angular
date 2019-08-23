import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, Inject, ComponentFactoryResolver } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Store, select } from '@ngrx/store';

import { Observable, Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

import { AppState } from '../core/store';
import { AppConfig } from '../app.config';
import { DirectoryView, DiscoveryView, Filter, FacetType } from '../core/model/view';
import { SolrDocument } from '../core/model/discovery';
import { SdrPage, SdrFacet } from '../core/model/sdr';

import { selectAllResources, selectResourcesPage, selectResourcesFacets, selectResourceById, selectDiscoveryViewByCollection } from '../core/store/sdr';
import { selectRouterQueryParams, selectRouterQueryParamFilters, selectRouterSearchQuery } from '../core/store/router';

import { addFacetsToQueryParams, addFiltersToQueryParams, addExportToQueryParams, addBoostToQueryParams } from '../shared/utilities/view.utility';

@Component({
    selector: 'scholars-directory',
    templateUrl: 'directory.component.html',
    styleUrls: ['directory.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DirectoryComponent implements OnDestroy, OnInit {

    public query: Observable<string>;

    public queryParams: Observable<Params>;

    public filters: Observable<any[]>;

    public directoryView: Observable<DirectoryView>;

    public discoveryView: Observable<DiscoveryView>;

    public documents: Observable<SolrDocument[]>;

    public page: Observable<SdrPage>;

    public facets: Observable<SdrFacet[]>;

    private subscriptions: Subscription[];

    constructor(
        @Inject('APP_CONFIG') private appConfig: AppConfig,
        private store: Store<AppState>,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.subscriptions = [];
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription: Subscription) => {
            subscription.unsubscribe();
        });
    }

    ngOnInit() {
        this.query = this.store.pipe(select(selectRouterSearchQuery));
        this.queryParams = this.store.pipe(select(selectRouterQueryParams));
        this.filters = this.store.pipe(select(selectRouterQueryParamFilters));
        this.subscriptions.push(this.route.params.subscribe((params) => {
            if (params.view) {
                this.directoryView = this.store.pipe(
                    select(selectResourceById('directoryViews', params.view)),
                    filter((view: DirectoryView) => view !== undefined),
                    tap((view: DirectoryView) => {
                        this.documents = this.store.pipe(select(selectAllResources<SolrDocument>(view.collection)));
                        this.page = this.store.pipe(select(selectResourcesPage<SolrDocument>(view.collection)));
                        this.facets = this.store.pipe(select(selectResourcesFacets<SolrDocument>(view.collection)));
                        this.discoveryView = this.store.pipe(
                            select(selectDiscoveryViewByCollection(view.collection)),
                            filter((discoveryView: DiscoveryView) => discoveryView !== undefined)
                        );
                    })
                );
            }
        }));
    }

    public isActive(queryParams: Params, option: string): boolean {
        if (queryParams.index !== undefined) {
            return queryParams.index.split(',')[2] === option;
        }
        return option === 'All';
    }

    public showFilter(directoryView: DirectoryView, actualFilter: Filter): boolean {
        // tslint:disable-next-line:no-shadowed-variable
        for (const filter of directoryView.filters) {
            if (this.equals(filter, actualFilter)) {
                return false;
            }
        }
        return true;
    }

    public getFilterField(directoryView: DirectoryView, actualFilter: Filter): string {
        return actualFilter.field;
    }

    public getFilterValue(directoryView: DirectoryView, actualFilter: Filter): string {
        for (const facet of directoryView.facets) {
            if (facet.type === FacetType.DATE_YEAR && facet.field === actualFilter.field) {
                return actualFilter.value.substring(1, actualFilter.value.length - 1).split(' TO ')[0];
            }
        }
        return actualFilter.value;
    }

    public hasExport(directoryView: DirectoryView): boolean {
        return directoryView.export !== undefined && directoryView.export.length > 0;
    }

    public getDirectoryRouterLink(directoryView: DirectoryView): string[] {
        return ['/directory', directoryView.name];
    }

    public getDirectoryQueryParams(directoryView: DirectoryView, option: string, currentQueryParams: Params, filters: Filter[] = [], removeFilter: Filter): Params {
        const queryParams: Params = this.getQueryParams(directoryView);
        addFacetsToQueryParams(queryParams, directoryView);
        if (option) {
            queryParams.index = `${directoryView.index.field},${directoryView.index.operationKey},${option}`;
        } else {
            queryParams.index = currentQueryParams.index;
        }
        // tslint:disable-next-line:no-shadowed-variable
        filters.filter((filter: Filter) => !this.equals(filter, removeFilter)).forEach((filter: Filter) => {
            queryParams[`${filter.field}.filter`] = filter.value;
        });
        return queryParams;
    }

    public getResetQueryParams(directoryView: DirectoryView): Params {
        const queryParams: Params = this.getQueryParams(directoryView);
        return queryParams;
    }

    public getDirectoryExportUrl(directoryView: DirectoryView, params: Params): string {
        const queryParams: Params = Object.assign({}, params);
        queryParams.filters = queryParams.facets;
        queryParams.facets = null;
        queryParams.collection = null;
        addExportToQueryParams(queryParams, directoryView);
        const tree = this.router.createUrlTree([''], { queryParams });
        const query = tree.toString().substring(1);
        return `${this.appConfig.serviceUrl}/${directoryView.collection}/search/export${query}`;
    }

    private getQueryParams(directoryView: DirectoryView): Params {
        const queryParams: Params = {};
        queryParams.collection = directoryView.collection;
        queryParams.index = undefined;
        queryParams.page = 1;
        addFacetsToQueryParams(queryParams, directoryView);
        addFiltersToQueryParams(queryParams, directoryView);
        addBoostToQueryParams(queryParams, directoryView);
        // NOTE: currently ignoring sort of CollectionView and applying sort asc by index field
        queryParams.sort = `${directoryView.index.field},asc`;
        return queryParams;
    }

    private equals(filterOne: Filter, filterTwo: Filter): boolean {
        return filterOne.field === filterTwo.field && filterOne.value === filterTwo.value;
    }

}
