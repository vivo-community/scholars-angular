export interface Hero {
  readonly imageUri: string;
  readonly imageAlt: string;
  readonly watermarkImageUri: string;
  readonly watermarkText: string;
  readonly helpText: string;
  readonly baseText: string;
  readonly fontColor: string;
  readonly linkColor: string;
  readonly linkHoverColor: string;
  readonly searchInfoColor: string;
  readonly interval: number;
}
