import { mapEnumToOptions } from '@abp/ng.core';

export enum EntityAction {
  None = 0,
  Create = 1,
  Update = 2,
  Delete = 3,
}

export const entityActionOptions = mapEnumToOptions(EntityAction);
