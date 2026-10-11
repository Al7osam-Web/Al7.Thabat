import { mapEnumToOptions } from '@abp/ng.core';

export enum PageEnum {
  About = 1,
  Contact = 2,
  Terms = 4,
  Privacy = 6,
}

export const pageEnumOptions = mapEnumToOptions(PageEnum);
