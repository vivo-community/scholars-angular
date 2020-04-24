import { OpKey } from '../view';

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

export interface Queryable {
  readonly expression: string;
  readonly defaultField?: string;
  readonly minimumShouldMeet?: string;
  readonly queryField?: string;
  readonly boostQuery?: string;
  readonly fields?: string;
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
  readonly query?: Queryable;
  readonly filters?: Filterable[];
  readonly facets?: Facetable[];
  readonly boosts?: Boostable[];
  readonly highlight?: Highlightable;
  readonly page?: Pageable;
}
