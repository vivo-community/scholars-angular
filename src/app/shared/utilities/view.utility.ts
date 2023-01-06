import { isPlatformBrowser } from '@angular/common';
import { Params } from '@angular/router';

import { Direction } from '../../core/model/request';
import { SdrPage } from '../../core/model/sdr';
import { Boost, CollectionView, DiscoveryView, Export, Facet, FacetType, Filter, OpKey, Sort } from '../../core/model/view';
import { FILTER_VALUE_DELIMITER } from './discovery.utility';

const addFacetsToQueryParams = (queryParams: Params, collectionView: CollectionView): void => {
  if (collectionView.facets && collectionView.facets.length > 0) {
    queryParams.facets = '';
    collectionView.facets.forEach((facet: Facet) => {
      queryParams.facets += queryParams.facets.length > 0 ? `,${facet.field}` : facet.field;
      ['type', 'pageSize', 'pageNumber', 'rangeStart', 'rangeEnd', 'rangeGap'].forEach((key: string) => {
        queryParams[`${facet.field}.${key}`] = facet[key];
      });
      queryParams[`${facet.field}.sort`] = `${facet.sort},${facet.direction}`;
    });
  }
};

const addFieldsToQueryParams = (queryParams: Params, collectionView: CollectionView): void => {
  if (collectionView.fields && collectionView.fields.length > 0) {
    queryParams.fl = '';
    collectionView.fields.forEach((field: string) => {
      queryParams.fl += queryParams.fl.length > 0 ? `,${field}` : field;
    });
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
    queryParams.hl = discoveryView.highlightFields;
  }
  if (discoveryView.highlightPrefix && discoveryView.highlightPrefix.length > 0) {
    queryParams['hl.prefix'] = discoveryView.highlightPrefix;
  }
  if (discoveryView.highlightPostfix && discoveryView.highlightPostfix.length > 0) {
    queryParams['hl.postfix'] = discoveryView.highlightPostfix;
  }
};

const addExportToQueryParams = (queryParams: Params, collectionView: CollectionView): void => {
  if (collectionView.export && collectionView.export.length > 0) {
    queryParams.export = [];
    queryParams.fl = '';
    collectionView.export.forEach((exp: Export) => {
      queryParams.export.push(`${exp.valuePath},${exp.columnHeader}`);
      queryParams.fl += queryParams.fl.length > 0 ? `,${exp.valuePath}` : exp.valuePath;
    });
  }
};

const removeFilterFromQueryParams = (queryParams: Params, filterToRemove: Filter): void => {
  const filterValues = queryParams[`${filterToRemove.field}.filter`].split(FILTER_VALUE_DELIMITER);

  if (filterValues.length === 1) {
    queryParams.filters = queryParams.filters.split(',')
      .filter((filter: string) => filter !== filterToRemove.field)
      .join(',');

    if (!queryParams.filters) {
      delete queryParams.filters;
    }
    delete queryParams[`${filterToRemove.field}.filter`];
    delete queryParams[`${filterToRemove.field}.opKey`];

  } else if (filterValues.length > 1) {
    queryParams[`${filterToRemove.field}.filter`] = filterValues
      .filter((filterValue: string) => filterValue !== filterToRemove.value)
      .join(FILTER_VALUE_DELIMITER);
  } // else (filterValues.length < 1) do nothing 
};

const resetFiltersInQueryParams = (queryParams: Params, collectionView: CollectionView): void => {
  if (queryParams.filters && queryParams.filters.length > 0) {
    const defaultFilterFields = collectionView.filters.map((cf: Filter) => cf.field);
    const appliedFilterFields = queryParams.filters.split(',').filter((aff: string) => defaultFilterFields.indexOf(aff) < 0);
    appliedFilterFields.forEach(aff => {
      delete queryParams[`${aff}.filter`];
      delete queryParams[`${aff}.opKey`];
    });
    queryParams.filters = defaultFilterFields.join(',');
    if (!queryParams.filters) {
      delete queryParams.filters;
    }
  }
};

const getQueryParams = (collectionView: CollectionView): Params => {
  const queryParams: Params = {};
  queryParams.collection = 'individual';
  addFieldsToQueryParams(queryParams, collectionView);
  addFacetsToQueryParams(queryParams, collectionView);
  addFiltersToQueryParams(queryParams, collectionView);
  addBoostToQueryParams(queryParams, collectionView);
  addSortToQueryParams(queryParams, collectionView);
  addDefaultSearchFieldToQueryParams(queryParams, collectionView as DiscoveryView);
  addHighlightsToQueryParams(queryParams, collectionView as DiscoveryView);
  return queryParams;
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
  const defaultFilterFields = collectionView.filters.map((cf: Filter) => cf.field);
  return filters.filter((af: Filter) => defaultFilterFields.indexOf(af.field) < 0).length > 0;
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

/**
 * Traverse object by path returning value else undefined.
 *
 * {
 *   'trainee': {
 *     'label': 'Name of organization'
 *   }
 * }
 * i.e. `trainee.label` returns 'Name of organizarion'
 *
 * @param doc solr document or any JSON object
 * @param path dot notation path
 * @returns value at path
 */
const getValueByPath = (doc: any, path: string): string | undefined => {
  let pathValue;
  path.split('.').forEach((p: string) => {
    pathValue = pathValue ? pathValue[p] : doc[p];
  });
  return pathValue;
};

const getResourcesPage = (resources: any[], sort: Sort[], page: SdrPage): any[] => {
  let sorted = [].concat(resources);
  // sort
  sorted = sorted.sort((a, b) => {
    let result = 0;
    for (const s of sort) {

      const aValue = getValueByPath(a, s.field);
      const bValue = getValueByPath(b, s.field);

      const isAsc = Direction[s.direction] === Direction.ASC;
      if (aValue === undefined) {
        return isAsc ? -1 : 1;
      }
      if (bValue === undefined) {
        return isAsc ? 1 : -1;
      }
      const av = s.date ? new Date(aValue) : aValue;
      const bv = s.date ? new Date(bValue) : bValue;
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
  removeFilterFromQueryParams,
  resetFiltersInQueryParams,
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
