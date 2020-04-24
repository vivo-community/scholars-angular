import { SdrFacet } from './sdr-facet';
import { SdrPage } from './sdr-page';
import { SdrCollectionLinks } from './sdr-collection-links';
import { SdrHighlight } from './sdr-highlight';

export interface SdrCollection {
  readonly page: SdrPage;
  readonly facets?: SdrFacet[];
  readonly highlights?: SdrHighlight[];
  readonly _embedded: any;
  readonly _links: SdrCollectionLinks;
}
