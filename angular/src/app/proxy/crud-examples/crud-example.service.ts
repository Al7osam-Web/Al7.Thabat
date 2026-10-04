import type { CreateUpdateCrudExampleDto, CrudExampleDto, GetCrudExampleListInput } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CrudExampleService {
  apiName = 'Default';
  

  create = (input: CreateUpdateCrudExampleDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CrudExampleDto>({
      method: 'POST',
      url: '/api/app/crud-example',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/crud-example/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CrudExampleDto>({
      method: 'GET',
      url: `/api/app/crud-example/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getList = (input: GetCrudExampleListInput, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<CrudExampleDto>>({
      method: 'GET',
      url: '/api/app/crud-example',
      params: { filter: input.filter, isActive: input.isActive, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdateCrudExampleDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CrudExampleDto>({
      method: 'PUT',
      url: `/api/app/crud-example/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
