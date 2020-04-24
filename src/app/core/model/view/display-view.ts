import { View } from './';
import { Filter, Sort } from './collection-view';

export enum Side {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface Subsection {
  readonly name: string;
  readonly field: string;
  readonly filters: Filter[];
  readonly sort: Sort[];
  readonly pageSize: number;
  readonly template: string;
  templateFunction?: (document: any) => string;
}

export interface DisplayTabSectionView extends View {
  readonly field: string;
  readonly filters: Filter[];
  readonly sort: Sort[];
  readonly hidden: boolean;
  readonly shared: boolean;
  readonly paginated: boolean;
  readonly pageSize: number;
  readonly template: string;
  templateFunction?: (document: any) => string;
  readonly requiredFields: string[];
  readonly lazyReferences: string[];
  readonly subsections: Subsection[];
}

export interface DisplayTabView extends View {
  readonly hidden: boolean;
  readonly sections: DisplayTabSectionView[];
}

export interface DisplayView extends View {
  readonly types: string[];
  readonly mainContentTemplate: string;
  mainContentTemplateFunction?: (document: any) => string;
  readonly leftScanTemplate: string;
  leftScanTemplateFunction?: (document: any) => string;
  readonly rightScanTemplate: string;
  rightScanTemplateFunction?: (document: any) => string;
  readonly asideTemplate: string;
  asideTemplateFunction?: (document: any) => string;
  readonly asideLocation: Side;
  readonly metaTemplates: any;
  metaTemplateFunctions?: any;
  readonly tabs: DisplayTabView[];
}
