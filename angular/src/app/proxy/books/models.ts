import type { EntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface BookColumnFilterDto {
  columnName?: string;
  value?: string;
  matchMode?: string;
}

export interface BookDto extends EntityDto<number> {
  isRelapse: boolean;
  nameAr?: string;
  nameEn?: string;
  coverImage?: string;
  isFree: boolean;
  creationTime?: string;
  media: BookMediaDto[];
}

export interface BookMediaDto extends EntityDto<number> {
  filePath?: string;
  sort: number;
}

export interface BookMediaInputDto {
  filePath: string;
  sort: number;
}

export interface BooksPagedResultDto {
  totalCount: number;
  items: BookDto[];
  totalBooks: number;
  availableBooks: number;
  freeBooks: number;
  relapseBooks: number;
}

export interface CreateUpdateBookDto {
  nameAr: string;
  nameEn?: string;
  coverImage?: string;
  isFree: boolean;
  isRelapse: boolean;
  mediaItems: BookMediaInputDto[];
}

export interface GetBooksInput extends PagedAndSortedResultRequestDto {
  columnFilters: BookColumnFilterDto[];
}
