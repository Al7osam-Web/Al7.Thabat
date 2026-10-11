import { RestService } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export enum EntityAction {
  Create = 1,
  Update = 2,
  Delete = 3,
}

export enum SitePageType {
  About = 1,
  Contact = 2,
  Terms = 4,
  Privacy = 6,
}

export const SitePageLanguage = {
  None: 0,
  Arabic: 1,
  English: 2,
} as const;

export interface SitePageItem {
  id?: number;
  key: string;
  value?: string;
  section?: string;
  language?: number;
  pageEnum?: number;
}

export interface SitePageChange {
  id?: number;
  key: string;
  value: string;
  section: string;
  language: number;
  pageEnum: number;
  entityAction: EntityAction;
}

@Injectable({ providedIn: 'root' })
export class SitePagesService {
  constructor(private readonly rest: RestService) {}

  getByPage(pageEnum: SitePageType): Observable<{ items: SitePageItem[] }> {
    return this.rest.request<any, { items: SitePageItem[] }>(
      {
        method: 'GET',
        url: '/api/app/site-pages',
        params: {
          pageEnum,
          skipCount: 0,
          maxResultCount: 300,
        },
      },
      { apiName: 'Default' }
    );
  }

  manage(sitePage: SitePageChange[]): Observable<boolean> {
    return this.rest.request<any, boolean>(
      {
        method: 'POST',
        url: '/api/app/site-pages/manage',
        body: { sitePage },
      },
      { apiName: 'Default' }
    );
  }
}

export function collectSitePageChange(
  target: SitePageChange[],
  items: SitePageItem[],
  pageEnum: number,
  section: string,
  key: string,
  value: string,
  language: number,
  fallbackLanguages: number[] = []
): void {
  const matches = (item: SitePageItem, lang: number) =>
    item.key === key && (item.section ?? section) === section && (item.language ?? lang) === lang;

  const existing =
    items.find(item => matches(item, language)) ??
    fallbackLanguages.map(lang => items.find(item => matches(item, lang))).find(item => !!item);
  const normalizedValue = value ?? '';

  if (existing?.id) {
    const languageChanged = (existing.language ?? language) !== language;
    if ((existing.value ?? '') !== normalizedValue || languageChanged) {
      target.push({
        id: existing.id,
        key,
        section: existing.section ?? section,
        value: normalizedValue,
        language,
        pageEnum,
        entityAction: EntityAction.Update,
      });
    }
    return;
  }

  if (!normalizedValue.trim()) {
    return;
  }

  target.push({
    key,
    section,
    value: normalizedValue,
    language,
    pageEnum,
    entityAction: EntityAction.Create,
  });
}

export function readSitePageValue(
  items: SitePageItem[],
  key: string,
  section: string,
  language: number
): string {
  return (
    items.find(
      item => item.key === key && (item.section ?? section) === section && (item.language ?? language) === language
    )?.value ?? ''
  );
}

export function removeExistingSitePageKey(
  target: SitePageChange[],
  items: SitePageItem[],
  pageEnum: number,
  section: string,
  key: string
): void {
  for (const item of items) {
    if (!item.id || item.key !== key || (item.section ?? section) !== section) {
      continue;
    }

    target.push({
      id: item.id,
      key,
      section: item.section ?? section,
      value: '',
      language: item.language ?? SitePageLanguage.None,
      pageEnum,
      entityAction: EntityAction.Delete,
    });
  }
}

export function isRichTextEmpty(value: string): boolean {
  return !(value ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}
