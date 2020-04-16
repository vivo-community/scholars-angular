import { CollectionView } from './';

export interface DiscoveryView extends CollectionView {
  readonly defaultSearchField?: string;
  readonly highlightFields: string[];
  readonly highlightPrefix?: string;
  readonly highlightPostfix?: string;
}
