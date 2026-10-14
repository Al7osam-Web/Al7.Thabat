import type { TaskStage } from './task-stage.enum';
import type { EntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface CreateUpdateTaskDto {
  stage: TaskStage;
  titleAr: string;
  titleEn?: string;
  subTitleAr?: string;
  subTitleEn?: string;
  day: number;
}

export interface GetTasksInput extends PagedAndSortedResultRequestDto {
  columnFilters: TaskColumnFilterDto[];
}

export interface TaskColumnFilterDto {
  columnName?: string;
  value?: string;
  matchMode?: string;
}

export interface TaskDto extends EntityDto<number> {
  stage?: TaskStage;
  titleAr?: string;
  titleEn?: string;
  subTitleAr?: string;
  subTitleEn?: string;
  day: number;
  creationTime?: string;
}

export interface TasksPagedResultDto {
  totalCount: number;
  items: TaskDto[];
  totalTasks: number;
  sevenDaysCount: number;
  thirtyDaysCount: number;
  ninetyDaysCount: number;
}
