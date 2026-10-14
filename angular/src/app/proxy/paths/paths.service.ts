import type { CreateUpdatePathDto, GetPathsInput, PathDto, PathsPagedResultDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PathsService {
  apiName = 'Default';
  

  create = (input: CreateUpdatePathDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PathDto>({
      method: 'POST',
      url: '/api/app/paths',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/paths/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PathDto>({
      method: 'GET',
      url: `/api/app/paths/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getPaged = (input: GetPathsInput, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PathsPagedResultDto>({
      method: 'POST',
      url: '/api/app/paths/paged',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  update = (id: number, input: CreateUpdatePathDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PathDto>({
      method: 'PUT',
      url: `/api/app/paths/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
