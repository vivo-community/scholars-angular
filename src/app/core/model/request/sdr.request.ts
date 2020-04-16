import { OpKey } from '../view';
import { NgbHighlight } from '@ng-bootstrap/ng-bootstrap';

export enum Direction {
  ASC = 'asc',
  DESC = 'desc',
}

export interface Sort {
  readonly name: string;
  readonly direction: Direction;
}

export interface Pageable {
  readonly number: number;
  readonly size: number;
  readonly sort: Sort[];
}

export interface Facetable {
  readonly field: string;
  type?: string;
  pageSize?: number;
  pageNumber?: number;
  sort?: string;
  filter?: string;
}

export interface Filterable {
  readonly field: string;
  readonly value: string;
  readonly opKey: OpKey;
}

export interface Boostable {
  readonly field: string;
  readonly value: number;
}

export interface Highlightable {
  readonly fields: string[];
  readonly prefix?: string;
  readonly postfix?: string;
}

export interface SdrRequest {
  readonly page?: Pageable;
  readonly filters?: Filterable[];
  readonly facets?: Facetable[];
  readonly boosts?: Boostable[];
  readonly query?: string;
  readonly df?: string;
  readonly highlight?: Highlightable;
}
