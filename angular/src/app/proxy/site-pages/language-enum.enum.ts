import { mapEnumToOptions } from '@abp/ng.core';

export enum LanguageEnum {
  None = 0,
  Ar = 1,
  En = 2,
}

export const languageEnumOptions = mapEnumToOptions(LanguageEnum);
