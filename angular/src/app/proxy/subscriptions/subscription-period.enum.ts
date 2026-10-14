import { mapEnumToOptions } from '@abp/ng.core';

export enum SubscriptionPeriod {
  Monthly = 1,
  ThreeMonths = 3,
  Yearly = 12,
}

export const subscriptionPeriodOptions = mapEnumToOptions(SubscriptionPeriod);
