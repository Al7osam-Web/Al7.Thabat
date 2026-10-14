import type { SubscriptionPeriod } from './subscription-period.enum';
import type { EntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface CreateUpdateSubscriptionPackageDto {
  nameAr: string;
  nameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  period: SubscriptionPeriod;
  price: number;
  billedPrice: number;
  originalPrice: number;
  sort: number;
  isFeatured: boolean;
}

export interface GetSubscriptionPackagesInput extends PagedAndSortedResultRequestDto {
  columnFilters: SubscriptionPackageColumnFilterDto[];
}

export interface SubscriptionPackageColumnFilterDto {
  columnName?: string;
  value?: string;
  matchMode?: string;
}

export interface SubscriptionPackageDto extends EntityDto<number> {
  nameAr?: string;
  nameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  period?: SubscriptionPeriod;
  price: number;
  billedPrice: number;
  originalPrice: number;
  sort: number;
  isFeatured: boolean;
  creationTime?: string;
}

export interface SubscriptionPackagesPagedResultDto {
  totalCount: number;
  items: SubscriptionPackageDto[];
  totalPackages: number;
  yearlyCount: number;
  threeMonthsCount: number;
  monthlyCount: number;
}
