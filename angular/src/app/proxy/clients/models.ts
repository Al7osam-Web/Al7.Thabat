import type { EntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface ClientColumnFilterDto {
  columnName?: string;
  value?: string;
  matchMode?: string;
}

export interface ClientDto extends EntityDto<number> {
  name?: string;
  emailAddress?: string;
  phoneNumber?: string;
  isActive: boolean;
  creationTime?: string;
}

export interface CreateUpdateClientDto {
  name: string;
  emailAddress: string;
  phoneNumber: string;
  isActive: boolean;
}

export interface GetClientsInput extends PagedAndSortedResultRequestDto {
  columnFilters: ClientColumnFilterDto[];
}
