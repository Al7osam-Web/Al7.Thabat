import type { MediaUploadResultDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  apiName = 'Default';
  

  delete = (containerName: string, blobName: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: '/api/app/media',
      params: { containerName, blobName },
    },
    { apiName: this.apiName,...config });
  

  get = (containerName: string, blobName: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, Blob>({
      method: 'GET',
      responseType: 'blob',
      url: '/api/app/media',
      params: { containerName, blobName },
    },
    { apiName: this.apiName,...config });
  

  upload = (file: FormData, containerName?: string, width?: number, height?: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MediaUploadResultDto>({
      method: 'POST',
      url: '/api/app/media/upload',
      body: file,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
