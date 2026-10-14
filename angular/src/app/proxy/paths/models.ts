import type { TaskStage } from '../tasks/task-stage.enum';
import type { EntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface CreateUpdatePathDto {
  stage: TaskStage;
  day: number;
  feelings: PathEntryInputDto[];
  challenges: PathEntryInputDto[];
  tips: PathEntryInputDto[];
}

export interface GetPathsInput extends PagedAndSortedResultRequestDto {
  columnFilters: PathColumnFilterDto[];
}

export interface PathColumnFilterDto {
  columnName?: string;
  value?: string;
  matchMode?: string;
}

export interface PathDto extends EntityDto<number> {
  stage?: TaskStage;
  day: number;
  feelingsCount: number;
  challengesCount: number;
  tipsCount: number;
  creationTime?: string;
  feelings: PathEntryDto[];
  challenges: PathEntryDto[];
  tips: PathEntryDto[];
}

export interface PathEntryDto {
  descriptionAr?: string;
  descriptionEn?: string;
  sort: number;
}

export interface PathEntryInputDto {
  descriptionAr: string;
  descriptionEn?: string;
  sort: number;
}

export interface PathsPagedResultDto {
  totalCount: number;
  items: PathDto[];
  totalPaths: number;
  sevenDaysCount: number;
  thirtyDaysCount: number;
  ninetyDaysCount: number;
}
