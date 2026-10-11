import type { PageEnum } from './page-enum.enum';
import type { LanguageEnum } from './language-enum.enum';
import type { EntityAction } from './entity-action.enum';
import type { EntityDto, PagedResultRequestDto } from '@abp/ng.core';

export interface CreateSitePageDto {
  id?: number;
  key?: string;
  value?: string;
  section?: string;
  pageEnum?: PageEnum;
  language?: LanguageEnum;
  sort?: number;
  isHidden?: boolean;
  entityAction?: EntityAction;
}

export interface GetAllSitePages extends PagedResultRequestDto {
  pageEnum?: PageEnum;
  language?: LanguageEnum;
  isHidden?: boolean;
  key?: string;
  section?: string;
}

export interface ManageSitePageDto {
  sitePage: CreateSitePageDto[];
}

export interface SitePageDto extends EntityDto<number> {
  key?: string;
  value?: string;
  section?: string;
  pageEnum?: PageEnum;
  language?: LanguageEnum;
  sort?: number;
  isHidden?: boolean;
}
