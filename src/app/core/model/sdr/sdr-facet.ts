import { SdrFacetEntry } from './sdr-facet-entry';

export interface SdrFacet {
    readonly field: string;
    entries: SdrFacetEntry[];
}
