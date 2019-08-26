import { OperationKey } from '../view';

export enum Direction {
    ASC = 'asc',
    DESC = 'desc'
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

export interface Indexable {
    readonly field: string;
    readonly operationKey: OperationKey;
    readonly option: string;
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
    readonly value: number;
}

export interface Boostable {
    readonly field: string;
    readonly value: number;
}

export interface SdrRequest {
    readonly pageable?: Pageable;
    readonly indexable?: Indexable;
    readonly facets?: Facetable[];
    readonly boosts?: Boostable[];
    readonly query?: string;
}
