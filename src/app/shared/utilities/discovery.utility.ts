import { Params } from '@angular/router';

import { CustomRouterState } from '../../core/store/router/router.reducer';
import { SdrRequest, Pageable, Sort, Direction, Facetable, Indexable, Boostable } from '../../core/model/request';
import { OperationKey } from '../../core/model/view';

export const createSdrRequest = (routerState: CustomRouterState): SdrRequest => {
    const queryParams = routerState.queryParams;
    return {
        pageable: buildPageable(queryParams),
        facets: buildFacets(queryParams),
        boosts: buildBoosts(queryParams),
        indexable: buildIndexable(queryParams),
        query: queryParams.query
    };
};

const buildPageable = (queryParams: Params): Pageable => {
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

const buildIndexable = (queryParams: Params): Indexable => {
    if (queryParams.index) {
        const indexSplit: string[] = queryParams.index.split(',');
        return {
            field: indexSplit[0],
            operationKey: OperationKey[indexSplit[1]],
            option: indexSplit[2]
        };
    }
};
