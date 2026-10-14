import type { CreateUpdateSurveyQuestionDto, GetSurveyQuestionsInput, SurveyQuestionDto, SurveyQuestionsPagedResultDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SurveyQuestionsService {
  apiName = 'Default';
  

  create = (input: CreateUpdateSurveyQuestionDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SurveyQuestionDto>({
      method: 'POST',
      url: '/api/app/survey-questions',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/survey-questions/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SurveyQuestionDto>({
      method: 'GET',
      url: `/api/app/survey-questions/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getPaged = (input: GetSurveyQuestionsInput, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SurveyQuestionsPagedResultDto>({
      method: 'POST',
      url: '/api/app/survey-questions/paged',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  update = (id: number, input: CreateUpdateSurveyQuestionDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SurveyQuestionDto>({
      method: 'PUT',
      url: `/api/app/survey-questions/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
