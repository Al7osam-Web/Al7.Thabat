import type { FullAuditedEntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface CreateUpdateCrudExampleDto {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface CrudExampleDto extends FullAuditedEntityDto<string> {
  name?: string;
  description?: string;
  isActive: boolean;
}

export interface GetCrudExampleListInput extends PagedAndSortedResultRequestDto {
  filter?: string;
  isActive?: boolean;
}
