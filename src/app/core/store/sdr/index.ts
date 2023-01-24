import { createSelector, createFeatureSelector } from '@ngrx/store';

import { DiscoveryView, DisplayView, DirectoryView, CollectionView, Filter } from '../../model/view';
import { SdrResource } from '../../model/sdr';

import * as fromSdr from './sdr.reducer';

export const selectSdrState = <R extends SdrResource>(name: string) => createFeatureSelector<fromSdr.SdrState<R>>(name);

export const selectResourceIds = <R extends SdrResource>(name: string) => createSelector(selectSdrState<R>(name), fromSdr.selectIds(name));
export const selectResourceEntities = <R extends SdrResource>(name: string) => createSelector(selectSdrState<R>(name), fromSdr.selectEntities(name));
export const selectAllResources = <R extends SdrResource>(name: string) => createSelector(selectSdrState<R>(name), fromSdr.selectAll(name));
export const selectResourcesTotal = <R extends SdrResource>(name: string) => createSelector(selectSdrState<R>(name), fromSdr.selectTotal(name));

export const selectResourceError = <R extends SdrResource>(name: string) => createSelector(selectSdrState<R>(name), fromSdr.getError);
export const selectResourceIsCounting = <R extends SdrResource>(name: string) => createSelector(selectSdrState<R>(name), fromSdr.isCounting);
export const selectResourceIsLoading = <R extends SdrResource>(name: string) => createSelector(selectSdrState<R>(name), fromSdr.isLoading);
export const selectResourceIsDereferencing = <R extends SdrResource>(name: string) => createSelector(selectSdrState<R>(name), fromSdr.isDereferencing);
export const selectResourceIsUpdating = <R extends SdrResource>(name: string) => createSelector(selectSdrState<R>(name), fromSdr.isUpdating);

export const selectResourcesCounts = <R extends SdrResource>(name: string) => createSelector(selectSdrState<R>(name), fromSdr.getCounts);
export const selectResourcesCountByLabel = <R extends SdrResource>(name: string, label: string) => createSelector(selectSdrState<R>(name), fromSdr.getCountByLabel(label));
export const selectResourcesPage = <R extends SdrResource>(name: string) => createSelector(selectSdrState<R>(name), fromSdr.getPage);
export const selectResourcesFacets = <R extends SdrResource>(name: string) => createSelector(selectSdrState<R>(name), fromSdr.getFacets);
export const selectResourcesLinks = <R extends SdrResource>(name: string) => createSelector(selectSdrState<R>(name), fromSdr.getLinks);
export const selectResourcesRecentlyUpdated = <R extends SdrResource>(name: string) => createSelector(selectSdrState<R>(name), fromSdr.getRecentlyUpdated);
export const selectResourcesDataNetwork = <R extends SdrResource>(name: string) => createSelector(selectSdrState<R>(name), fromSdr.getDataNetwork);

export const selectResourceById = <R extends SdrResource>(name: string, id: string) => createSelector(selectResourceEntities<R>(name), (resources) => resources[id]);

export const selectCollectionViewByName = (collectionViewType: string, name: string) => createSelector(selectResourceEntities<CollectionView>(collectionViewType), (collectionViews) => collectionViews[name]);

const findCollectionView = (collectionViews, clazz: string, defaultName: string): CollectionView => {
  let view;
  for (const collectionView of collectionViews) {
    const viewByClass = collectionView.filters.find((filter: Filter) => filter.field === 'class');
    if (!!viewByClass && viewByClass.value.startsWith(clazz)) {
      view = collectionView;
      break;
    }
    if (collectionView.name === defaultName) {
      view = collectionView;
    }
  }
  return view;
};

export const selectDirectoryViewByClass = (clazz: string) => createSelector(selectAllResources<DirectoryView>('directoryViews'), (resources) => findCollectionView(resources, clazz, 'People'));

export const selectDiscoveryViewByClass = (clazz: string) => createSelector(selectAllResources<DiscoveryView>('discoveryViews'), (resources) => findCollectionView(resources, clazz, 'People'));

const findDisplayView = (displayViews, types: string[], defaultName: string): DisplayView => {
  let view;
  for (const key in displayViews) {
    if (displayViews.hasOwnProperty(key)) {
      for (const i in types) {
        if (displayViews.hasOwnProperty(key)) {
          if (displayViews[key].types.indexOf(types[i]) >= 0) {
            view = displayViews[key];
            break;
          }
        }
      }
      if (displayViews[key].name === defaultName) {
        view = displayViews[key];
      }
    }
  }
  return view;
};

export const selectDisplayViewByTypes = (types: string[]) => createSelector(selectResourceEntities<DisplayView>('displayViews'), (resources) => findDisplayView(resources, types, 'Default'));
