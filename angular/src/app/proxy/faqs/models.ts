import type { EntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface CreateUpdateFaqDto {
  titleAr: string;
  titleEn?: string;
  descriptionAr: string;
  descriptionEn?: string;
  sort: number;
}

export interface FaqColumnFilterDto {
  columnName?: string;
  value?: string;
  matchMode?: string;
}

export interface FaqDto extends EntityDto<number> {
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  sort: number;
  creationTime?: string;
}

export interface FaqsPagedResultDto {
  totalCount: number;
  items: FaqDto[];
  totalFaqs: number;
}

export interface GetFaqsInput extends PagedAndSortedResultRequestDto {
  columnFilters: FaqColumnFilterDto[];
}
