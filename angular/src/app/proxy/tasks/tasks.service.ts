import type { CreateUpdateTaskDto, GetTasksInput, TaskDto, TasksPagedResultDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  apiName = 'Default';
  

  create = (input: CreateUpdateTaskDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, TaskDto>({
      method: 'POST',
      url: '/api/app/tasks',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/tasks/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, TaskDto>({
      method: 'GET',
      url: `/api/app/tasks/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getPaged = (input: GetTasksInput, config?: Partial<Rest.Config>) =>
    this.restService.request<any, TasksPagedResultDto>({
      method: 'POST',
      url: '/api/app/tasks/paged',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  update = (id: number, input: CreateUpdateTaskDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, TaskDto>({
      method: 'PUT',
      url: `/api/app/tasks/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
