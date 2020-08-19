import { View } from './';
import { Direction } from '../request';

export enum OpKey {
  BETWEEN = 'BETWEEN',
  CONTAINS = 'CONTAINS',
  ENDS_WITH = 'ENDS_WITH',
  EQUALS = 'EQUALS',
  EXPRESSION = 'EXPRESSION',
  FUZZY = 'FUZZY',
  NOT_EQUALS = 'NOT_EQUALS',
  STARTS_WITH = 'STARTS_WITH'
}

export enum Layout {
  LIST = 'LIST',
  GRID = 'GRID'
}

export enum FacetType {
  STRING = 'STRING',
  DATE_YEAR = 'DATE_YEAR',
  NUMBER_RANGE = 'NUMBER_RANGE'
}

export enum FacetSort {
  COUNT = 'COUNT',
  INDEX = 'INDEX'
}

export interface Sort {
  readonly field: string;
  readonly direction: Direction;
  readonly date: boolean;
}

export interface Export {
  readonly columnHeader: string;
  readonly valuePath: string;
}

export interface Facet {
  readonly name: string;
  readonly field: string;
  readonly type: FacetType;
  readonly pageSize: number;
  readonly pageNumber: number;
  readonly sort: FacetSort;
  readonly direction: Direction;
  readonly collapsed: boolean;
  readonly hidden: boolean;
  readonly rangeStart?: string;
  readonly rangeEnd?: string;
  readonly rangeGap?: string;
}

export interface Filter {
  readonly field: string;
  readonly value: string;
  readonly opKey: OpKey;
}

export interface Boost {
  readonly field: string;
  readonly value: number;
}

export interface CollectionView extends View {
  readonly layout: Layout;
  readonly templates: any;
  templateFunctions?: any;
  readonly styles: string[];
  readonly fields: string[];
  readonly facets: Facet[];
  readonly filters: Filter[];
  readonly boosts: Boost[];
  readonly sort: Sort[];
  readonly export: Export[];
}
