import type { EntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface CreateUpdateSurveyQuestionDto {
  titleAr: string;
  titleEn?: string;
  sort: number;
  answers: SurveyAnswerInputDto[];
}

export interface GetSurveyQuestionsInput extends PagedAndSortedResultRequestDto {
  columnFilters: SurveyQuestionColumnFilterDto[];
}

export interface SurveyAnswerDto extends EntityDto<number> {
  titleAr?: string;
  titleEn?: string;
  degree: number;
  sort: number;
}

export interface SurveyAnswerInputDto {
  titleAr: string;
  titleEn?: string;
  degree: number;
  sort: number;
}

export interface SurveyQuestionColumnFilterDto {
  columnName?: string;
  value?: string;
  matchMode?: string;
}

export interface SurveyQuestionDto extends EntityDto<number> {
  titleAr?: string;
  titleEn?: string;
  sort: number;
  answersCount: number;
  creationTime?: string;
  answers: SurveyAnswerDto[];
}

export interface SurveyQuestionsPagedResultDto {
  totalCount: number;
  items: SurveyQuestionDto[];
  totalQuestions: number;
  totalAnswers: number;
}
