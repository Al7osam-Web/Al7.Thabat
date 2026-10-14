import type { CreateUpdateFaqDto, FaqDto, FaqsPagedResultDto, GetFaqsInput } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FaqsService {
  apiName = 'Default';
  

  create = (input: CreateUpdateFaqDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, FaqDto>({
      method: 'POST',
      url: '/api/app/faqs',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/faqs/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, FaqDto>({
      method: 'GET',
      url: `/api/app/faqs/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getPaged = (input: GetFaqsInput, config?: Partial<Rest.Config>) =>
    this.restService.request<any, FaqsPagedResultDto>({
      method: 'POST',
      url: '/api/app/faqs/paged',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  update = (id: number, input: CreateUpdateFaqDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, FaqDto>({
      method: 'PUT',
      url: `/api/app/faqs/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
