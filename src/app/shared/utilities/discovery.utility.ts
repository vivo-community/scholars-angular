import { Params } from '@angular/router';

import { CustomRouterState } from '../../core/store/router/router.reducer';
import { SdrRequest, Pageable, Sort, Direction, Facetable, Filterable, Boostable } from '../../core/model/request';
import { OpKey } from '../../core/model/view';

export const createSdrRequest = (routerState: CustomRouterState): SdrRequest => {
    const queryParams = routerState.queryParams;
    return {
        page: buildPage(queryParams),
        filters: buildFilters(queryParams),
        facets: buildFacets(queryParams),
        boosts: buildBoosts(queryParams),
        query: queryParams.query
    };
};

const buildPage = (queryParams: Params): Pageable => {
    return {
        number: queryParams.page,
        size: queryParams.size,
        sort: buildSort(queryParams.sort)
    };
};

const buildSort = (sortParams: string): Sort[] => {
    const sort: Sort[] = [];
    if (sortParams !== undefined) {
        if (Array.isArray(sortParams)) {
            sortParams.forEach((currentSortParam) => sort.push(splitSort(currentSortParam)));
        } else {
            sort.push(splitSort(sortParams));
        }
    }
    return sort;
};

const splitSort = (sortParam: string): Sort => {
    const sortSplit = sortParam.split(',');
    return {
        name: sortSplit[0],
        direction: Direction[sortSplit[1] !== undefined ? sortSplit[1].toUpperCase() : 'ASC']
    };
};

const buildFilters = (queryParams: Params): Filterable[] => {
    const filters: Filterable[] = [];
    const fields: string[] = queryParams.filters !== undefined ? queryParams.filters.split(',') : [];
    fields.forEach((field: string) => {
        const value = queryParams[`${field}.filter`] ? queryParams[`${field}.filter`] : queryParams[`${field}.filter`];
        const opKey: OpKey = queryParams[`${field}.opKey`] ? queryParams[`${field}.opKey`] : 'EQUALS';
        filters.push({
            field,
            value,
            opKey
        });
    });
    return filters;
};

const buildFacets = (queryParams: Params): Facetable[] => {
    const facets: Facetable[] = [];
    const fields: string[] = queryParams.facets !== undefined ? queryParams.facets.split(',') : [];
    fields.forEach((field: string) => {
        const facet: Facetable = { field };
        ['type', 'pageSize', 'pageNumber', 'sort', 'filter'].forEach((key: string) => {
            if (queryParams[`${field}.${key}`]) {
                facet[key] = queryParams[`${field}.${key}`];
            }
        });
        facets.push(facet);
    });
    return facets;
};

const buildBoosts = (queryParams: Params): Boostable[] => {
    if (queryParams.boost) {
        if (Array.isArray(queryParams.boost)) {
            return queryParams.boost.map((ba: string) => ba.split(',')).map((parts: string[]) => {
                return { field: parts[0], value: Number(parts[1]) };
            });
        } else {
            const parts = queryParams.boost.split(',');
            return [{ field: parts[0], value: Number(parts[1]) }];
        }
    }
};
