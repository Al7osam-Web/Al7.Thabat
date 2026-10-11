import type { ClientDto, CreateUpdateClientDto, GetClientsInput } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ClientsService {
  apiName = 'Default';
  

  create = (input: CreateUpdateClientDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ClientDto>({
      method: 'POST',
      url: '/api/app/clients',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/clients/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ClientDto>({
      method: 'GET',
      url: `/api/app/clients/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getPaged = (input: GetClientsInput, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ClientDto>>({
      method: 'POST',
      url: '/api/app/clients/paged',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  update = (id: number, input: CreateUpdateClientDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ClientDto>({
      method: 'PUT',
      url: `/api/app/clients/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
