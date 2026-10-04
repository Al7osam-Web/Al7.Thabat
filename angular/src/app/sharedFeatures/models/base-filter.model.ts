import { FilterMetadata } from 'primeng/api';
import { Pagination } from './pagination.model';

export class BaseFilter {
  sorting: string = 'id';
  filterMetadata: { [s: string]: FilterMetadata[] };
  pagination: Pagination = new Pagination();
}

export class NewBaseFilter {
  Page_Index?: number;
  Page_Count?: number;
  Total_Count?: number;
  Total_Pages_Count?: number;
  Filters: BaseFilterMetaData[] = [];
  Sorting: BaseSortMetaData = new BaseSortMetaData();
  FilterNumber: number | 0;
}
export class ExcelBaseFilter extends NewBaseFilter {
  ExcelTitle: any;
  DisplayedColumns: ExcelDisplayedColumns[] = [];
}
export class ExcelDisplayedColumns {
  Name: any;
  Title: any;
}
export class BaseFilterMetaData {
  matchMode :string
  columnName?: string;
  relatedTableName?: string;
  value?: string;
  isDate?: boolean;
}
export class BaseSortMetaData {
  ColumnName?: string;
  Dir?: string;
}
export class DashboardFilter {
  DepartmentId?: string;
  LoginName?: string;
}
