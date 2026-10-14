import type { CreateUpdateSubscriptionPackageDto, GetSubscriptionPackagesInput, SubscriptionPackageDto, SubscriptionPackagesPagedResultDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionPackagesService {
  apiName = 'Default';
  

  create = (input: CreateUpdateSubscriptionPackageDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SubscriptionPackageDto>({
      method: 'POST',
      url: '/api/app/subscription-packages',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/subscription-packages/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SubscriptionPackageDto>({
      method: 'GET',
      url: `/api/app/subscription-packages/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getPaged = (input: GetSubscriptionPackagesInput, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SubscriptionPackagesPagedResultDto>({
      method: 'POST',
      url: '/api/app/subscription-packages/paged',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  update = (id: number, input: CreateUpdateSubscriptionPackageDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SubscriptionPackageDto>({
      method: 'PUT',
      url: `/api/app/subscription-packages/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
