import { Params } from '@angular/router';

import { CustomRouterState } from '../../core/store/router/router.reducer';
import { SdrRequest, Pageable, Sort, Direction, Facetable, Filterable, Boostable, Highlightable } from '../../core/model/request';
import { OpKey } from '../../core/model/view';
import { Queryable } from 'src/app/core/model/request/sdr.request';

export const createSdrRequest = (routerState: CustomRouterState): SdrRequest => {
  const queryParams = routerState.queryParams;
  return {
    query: buildQuery(queryParams),
    filters: buildFilters(queryParams),
    facets: buildFacets(queryParams),
    boosts: buildBoosts(queryParams),
    highlight: buildHightlight(queryParams),
    page: buildPage(queryParams),
  };
};

const buildQuery = (queryParams: Params): Queryable => {
  const query: any = {};
  if (queryParams.q && queryParams.q.length > 0) {
    query.expression = queryParams.q;
  }
  if (queryParams.df && queryParams.df.length > 0) {
    query.defaultField = queryParams.df;
  }
  if (queryParams.fl && queryParams.fl.length > 0) {
    query.fields = queryParams.fl;
  }
  return query as Queryable;
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
      opKey,
    });
  });
  return filters;
};

const buildFacets = (queryParams: Params): Facetable[] => {
  const facets: Facetable[] = [];
  const fields: string[] = queryParams.facets !== undefined ? queryParams.facets.split(',') : [];
  fields.forEach((field: string) => {
    const facet: Facetable = { field };
    ['type', 'pageSize', 'pageNumber', 'sort', 'rangeStart', 'rangeEnd', 'rangeGap'].forEach((key: string) => {
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
      return queryParams.boost
        .map((ba: string) => ba.split(','))
        .map((parts: string[]) => {
          return { field: parts[0], value: Number(parts[1]) };
        });
    } else {
      const parts = queryParams.boost.split(',');
      return [{ field: parts[0], value: Number(parts[1]) }];
    }
  }
};

const buildHightlight = (queryParams: Params): Highlightable => {
  const highlight: any = {
    fields: []
  };
  if (queryParams.hl && queryParams.hl.length > 0) {
    highlight.fields = Array.isArray(queryParams.hl) ? queryParams.hl : queryParams.hl.split(',');
  }
  if (queryParams['hl.prefix'] && queryParams['hl.prefix'].length > 0) {
    highlight.prefix = queryParams['hl.prefix'];
  }
  if (queryParams['hl.postfix'] && queryParams['hl.postfix'].length > 0) {
    highlight.postfix = queryParams['hl.postfix'];
  }
  return highlight as Highlightable;
};

const buildPage = (queryParams: Params): Pageable => {
  return {
    number: queryParams.page,
    size: queryParams.size,
    sort: buildSort(queryParams.sort),
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
    direction: Direction[sortSplit[1] !== undefined ? sortSplit[1].toUpperCase() : 'ASC'],
  };
};
