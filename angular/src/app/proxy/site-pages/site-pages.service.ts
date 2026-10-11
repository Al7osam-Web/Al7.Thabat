import type { GetAllSitePages, ManageSitePageDto, SitePageDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SitePagesService {
  apiName = 'Default';
  

  getList = (input: GetAllSitePages, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<SitePageDto>>({
      method: 'GET',
      url: '/api/app/site-pages',
      params: { pageEnum: input.pageEnum, language: input.language, isHidden: input.isHidden, key: input.key, section: input.section, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  manage = (input: ManageSitePageDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'POST',
      url: '/api/app/site-pages/manage',
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
