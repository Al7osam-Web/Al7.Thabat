import { mapEnumToOptions } from '@abp/ng.core';

export enum TaskStage {
  SevenDays = 7,
  ThirtyDays = 30,
  NinetyDays = 90,
}

export const taskStageOptions = mapEnumToOptions(TaskStage);
