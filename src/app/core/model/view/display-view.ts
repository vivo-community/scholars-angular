import { View } from './';
import { FieldView } from './field-view';

export enum Side {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface DisplaySubsectionView extends FieldView {
  readonly pageSize: number;
  readonly template: string;
  templateFunction?: (document: any) => string;
}

export interface DisplaySectionView extends FieldView {
  readonly hidden: boolean;
  readonly shared: boolean;
  readonly paginated: boolean;
  readonly pageSize: number;
  readonly template: string;
  templateFunction?: (document: any) => string;
  readonly requiredFields: string[];
  readonly lazyReferences: string[];
  readonly subsections: DisplaySubsectionView[];
}

export interface DisplayTabView extends View {
  readonly hidden: boolean;
  readonly sections: DisplaySectionView[];
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
