import { Params } from '@angular/router';

import { Export, Facet, Filter, CollectionView, Sort, Boost } from '../../core/model/view';

const addFacetsToQueryParams = (queryParams: Params, collectionView: CollectionView): void => {
    if (collectionView.facets && collectionView.facets.length > 0) {
        let facets = '';
        collectionView.facets.forEach((facet: Facet) => {
            facets += facets.length > 0 ? `,${facet.field}` : facet.field;
            ['type', 'pageSize', 'pageNumber'].forEach((key: string) => {
                queryParams[`${facet.field}.${key}`] = facet[key];
            });
            queryParams[`${facet.field}.sort`] = `${facet.sort},${facet.direction}`;
        });
        queryParams.facets = facets;
    }
};

const addFiltersToQueryParams = (queryParams: Params, collectionView: CollectionView): void => {
    if (collectionView.filters && collectionView.filters.length > 0) {
        collectionView.filters.forEach((filter: Filter) => {
            queryParams[`${filter.field}.filter`] = filter.value;
        });
    }
};

const addBoostToQueryParams = (queryParams: Params, collectionView: CollectionView): void => {
    if (collectionView.boosts && collectionView.boosts.length > 0) {
        queryParams.boost = [];
        collectionView.boosts.forEach((boost: Boost) => {
            queryParams.boost.push(`${boost.field},${boost.value}`);
        });
    }
};

const addSortToQueryParams = (queryParams: Params, collectionView: CollectionView): void => {
    if (collectionView.sort && collectionView.sort.length > 0) {
        queryParams.sort = [];
        collectionView.sort.forEach((sort: Sort) => {
            queryParams.sort.push(`${sort.field},${sort.direction}`);
        });
    }
};

const addExportToQueryParams = (queryParams: Params, collectionView: CollectionView): void => {
    if (collectionView.export && collectionView.export.length > 0) {
        queryParams.export = [];
        collectionView.export.forEach((exp: Export) => {
            queryParams.export.push(`${exp.valuePath},${exp.columnHeader}`);
        });
    }
};

export {
    addFacetsToQueryParams,
    addFiltersToQueryParams,
    addBoostToQueryParams,
    addSortToQueryParams,
    addExportToQueryParams
};
