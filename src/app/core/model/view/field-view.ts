import { View } from './';
import { Filter, Sort } from './collection-view';

export interface FieldView extends View {
  readonly field: string;
  readonly order: number;
  readonly filters: Filter[];
  readonly sort: Sort[];
}
