import type { BookDto, BooksPagedResultDto, CreateUpdateBookDto, GetBooksInput } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BooksService {
  apiName = 'Default';
  

  create = (input: CreateUpdateBookDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, BookDto>({
      method: 'POST',
      url: '/api/app/books',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/books/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, BookDto>({
      method: 'GET',
      url: `/api/app/books/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getPaged = (input: GetBooksInput, config?: Partial<Rest.Config>) =>
    this.restService.request<any, BooksPagedResultDto>({
      method: 'POST',
      url: '/api/app/books/paged',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  update = (id: number, input: CreateUpdateBookDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, BookDto>({
      method: 'PUT',
      url: `/api/app/books/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
