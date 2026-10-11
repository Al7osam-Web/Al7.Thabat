import { RestService } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ClientItem {
  id: number;
  name?: string;
  emailAddress?: string;
  phoneNumber?: string;
  isActive: boolean;
  creationTime?: string;
}

export interface ClientInput {
  name: string;
  emailAddress: string;
  phoneNumber: string;
  isActive: boolean;
}

export interface ClientColumnFilter {
  columnName?: string;
  value?: string;
  matchMode?: string;
}

export interface GetClientsInput {
  skipCount: number;
  maxResultCount: number;
  sorting?: string;
  columnFilters: ClientColumnFilter[];
}

@Injectable({ providedIn: 'root' })
export class ClientsApiService {
  constructor(private readonly rest: RestService) {}

  getPaged(input: GetClientsInput): Observable<{ items: ClientItem[]; totalCount: number }> {
    return this.rest.request<any, { items: ClientItem[]; totalCount: number }>(
      {
        method: 'POST',
        url: '/api/app/clients/paged',
        body: input,
      },
      { apiName: 'Default' }
    );
  }

  get(id: number): Observable<ClientItem> {
    return this.rest.request<any, ClientItem>(
      {
        method: 'GET',
        url: `/api/app/clients/${id}`,
      },
      { apiName: 'Default' }
    );
  }

  create(input: ClientInput): Observable<ClientItem> {
    return this.rest.request<any, ClientItem>(
      {
        method: 'POST',
        url: '/api/app/clients',
        body: input,
      },
      { apiName: 'Default' }
    );
  }

  update(id: number, input: ClientInput): Observable<ClientItem> {
    return this.rest.request<any, ClientItem>(
      {
        method: 'PUT',
        url: `/api/app/clients/${id}`,
        body: input,
      },
      { apiName: 'Default' }
    );
  }

  delete(id: number): Observable<void> {
    return this.rest.request<any, void>(
      {
        method: 'DELETE',
        url: `/api/app/clients/${id}`,
      },
      { apiName: 'Default' }
    );
  }
}
