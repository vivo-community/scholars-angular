import { CollectionView, OpKey } from './';

export interface Index {
  readonly field: string;
  readonly opKey: OpKey;
  readonly options: string[];
}

export interface DirectoryView extends CollectionView {
  readonly index: Index;
}
