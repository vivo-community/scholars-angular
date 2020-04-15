import { CollectionView } from './';

export interface DiscoveryView extends CollectionView {
  readonly defaultSearchField?: string;
  readonly highlightFields: string[];
  readonly highlightPre?: string;
  readonly highlightPost?: string;
}
