import { TableHeaderType } from '../enum/table/table-header-type';
import { MegaMenuItem } from 'primeng/api';
export interface ITableHeader {
  field: string;
  name: string;
  recordKey?: boolean;
  hidden?: boolean;
  sortable?: boolean;
  removeFlitter?: boolean;
  removeSorting?: boolean;
  isPrimary?: boolean;
  isClickable?: boolean;
  canGroup?: boolean;
  cssClass?: string;
  type?: TableHeaderType;
  enum?: any;
  options?: any;
  width?: number;
  minWidth?: string;
  extraData?: any;
  dateFormat?: string;
  pattern?: string;
  pipeName?: any;
 isSimpleFilter?:boolean;
 disabled?:boolean;
 required?:boolean;
 alwaysVisible?:boolean;
 isCanAddItem?:boolean;
 relatedTableName?: string;

 command?(event: MenuItemCommandEvent): void;
 

}
/**
 * Custom command event
 * @see {@link MenuItem.command}
 * @group Events
 */
export interface MenuItemCommandEvent {
    /**
     * Browser event.
     */
    originalEvent?: Event;
    /**
     * Selected menu item.
     */
    item?: ITableHeader | MegaMenuItem;
    /**
     * Index of the selected item.
     */
    index?: number;
}
