import { isPlatformBrowser } from '@angular/common';
import { Params } from '@angular/router';

import { Export, Facet, Filter, CollectionView, Sort, Boost, OpKey, FacetType, DiscoveryView } from '../../core/model/view';
import { SdrPage } from '../../core/model/sdr';
import { Direction } from '../../core/model/request';

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
    let filters = '';
    collectionView.filters.forEach((filter: Filter) => {
      filters += filters.length > 0 ? `,${filter.field}` : filter.field;
      queryParams[`${filter.field}.filter`] = filter.value;
      queryParams[`${filter.field}.opKey`] = filter.opKey;
    });
    queryParams.filters = filters;
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

const addDefaultSearchFieldToQueryParams = (queryParams: Params, discoveryView: DiscoveryView): void => {
  if (discoveryView.defaultSearchField && discoveryView.defaultSearchField.length > 0) {
    queryParams.df = discoveryView.defaultSearchField;
  }
};

const addHighlightsToQueryParams = (queryParams: Params, discoveryView: DiscoveryView): void => {
  if (discoveryView.highlightFields && discoveryView.highlightFields.length > 0) {
    queryParams.hl = [];
    discoveryView.highlightFields.forEach((field: string) => {
      queryParams.hl.push(field);
    });
  }
  if (discoveryView.highlightPre && discoveryView.highlightPre.length > 0) {
    queryParams['hl.pre'] = discoveryView.highlightPre;
  }
  if (discoveryView.highlightPost && discoveryView.highlightPost.length > 0) {
    queryParams['hl.post'] = discoveryView.highlightPost;
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

const getQueryParams = (collectionView: CollectionView): Params => {
  const queryParams: Params = {};
  queryParams.collection = 'individual';
  addFacetsToQueryParams(queryParams, collectionView);
  addFiltersToQueryParams(queryParams, collectionView);
  addBoostToQueryParams(queryParams, collectionView);
  addSortToQueryParams(queryParams, collectionView);
  addDefaultSearchFieldToQueryParams(queryParams, collectionView as DiscoveryView);
  addHighlightsToQueryParams(queryParams, collectionView as DiscoveryView);
  return queryParams;
};

const applyFiltersToQueryParams = (queryParams: Params, collectionView: CollectionView, filters: Filter[], filterToRemove: Filter): void => {
  filters
    .filter((filter: Filter) => !equals(filter, filterToRemove))
    .filter((filter: Filter) => showFilter(collectionView, filter))
    .forEach((filter: Filter) => {
      queryParams[`${filter.field}.filter`] = filter.value;
      queryParams[`${filter.field}.opKey`] = filter.opKey;
      if (!queryParams.filters) {
        queryParams.filters = filter.field;
      } else {
        queryParams.filters += `,${filter.field}`;
      }
    });
};

const showFilter = (collectionView: CollectionView, actualFilter: Filter): boolean => {
  for (const filter of collectionView.filters) {
    if (equals(filter, actualFilter)) {
      return false;
    }
  }
  return actualFilter.opKey === OpKey.BETWEEN || actualFilter.opKey === OpKey.EQUALS;
};

const showClearFilters = (collectionView: CollectionView, filters: Filter[]): boolean => {
  return filters.length > collectionView.filters.length;
};

const getFilterField = (collectionView: CollectionView, actualFilter: Filter): string => {
  return actualFilter.field;
};

const getFilterValue = (collectionView: CollectionView, actualFilter: Filter): string => {
  for (const facet of collectionView.facets) {
    if (facet.type === FacetType.DATE_YEAR && facet.field === actualFilter.field) {
      const from = actualFilter.value.substring(1, actualFilter.value.length - 1).split(' TO ')[0];
      const year = new Date(from).getFullYear() + 1;
      return year.toString();
    }
  }
  return actualFilter.value;
};

const hasExport = (collectionView: CollectionView): boolean => {
  return collectionView.export !== undefined && collectionView.export.length > 0;
};

const equals = (filterOne: Filter, filterTwo: Filter): boolean => {
  return filterTwo ? filterOne.field === filterTwo.field && filterOne.value === filterTwo.value : true;
};

const getResourcesPage = (resources: any[], sort: Sort[], page: SdrPage): any[] => {
  let sorted = [].concat(resources);
  // sort
  sorted = sorted.sort((a, b) => {
    let result = 0;
    for (const s of sort) {
      const isAsc = Direction[s.direction] === Direction.ASC;
      if (a[s.field] === undefined) {
        return isAsc ? -1 : 1;
      }
      if (b[s.field] === undefined) {
        return isAsc ? 1 : -1;
      }
      const av = s.date ? new Date(a[s.field]) : a[s.field];
      const bv = s.date ? new Date(b[s.field]) : b[s.field];
      if (isAsc) {
        result = av > bv ? 1 : av < bv ? -1 : 0;
      } else {
        result = av < bv ? 1 : av > bv ? -1 : 0;
      }
      if (result !== 0) {
        break;
      }
    }
    return result;
  });
  const pageStart = (page.number - 1) * page.size;
  const pageEnd = pageStart + page.size;
  return sorted.slice(pageStart, pageEnd);
};

const getSubsectionResources = (resources: any[], filters: Filter[]): any[] => {
  return resources.filter((r) => {
    for (const f of filters) {
      if (Array.isArray(r[f.field]) ? r[f.field].indexOf(f.value) < 0 : r[f.field] !== f.value) {
        return false;
      }
    }
    return true;
  });
};

const loadBadges = (platformId: string): void => {
  if (isPlatformBrowser(platformId)) {
    setTimeout(() => {
      // tslint:disable-next-line: no-string-literal
      window['_altmetric_embed_init']();
      // tslint:disable-next-line: no-string-literal
      window['__dimensions_embed'].addBadges();
    }, 250);
  }
};

export {
  addExportToQueryParams,
  applyFiltersToQueryParams,
  getQueryParams,
  showFilter,
  showClearFilters,
  getFilterField,
  getFilterValue,
  hasExport,
  getResourcesPage,
  getSubsectionResources,
  loadBadges
};
