import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FilterMetadata, MenuItem, PrimeNGConfig, SortMeta } from 'primeng/api';
import { Table } from 'primeng/table';

import { LocalizationService } from '@abp/ng.core';
import { ITableHeader } from 'src/app/sharedFeatures/models/itable-header';
import { EnumFilterComponent } from './enum-filter/enum-filter.component';
import { TableViewMood } from 'src/app/sharedFeatures/enum/table/table-view-mode';
import { TableHeaderType } from 'src/app/sharedFeatures/enum/table/table-header-type';
import { hasProperty } from 'src/app/sharedFeatures/functions/key-at-list-check';
import { groupBy } from 'src/app/sharedFeatures/functions/group-column-by';

import { AppComponentBase } from 'src/app/shared/app-component-base';
import { ToasterService } from '@abp/ng.theme.shared';
import { timer } from 'rxjs';
import { OverlayPanel } from 'primeng/overlaypanel';
import { MultiSelect } from 'primeng/multiselect';
import { environment } from 'src/environments/environment';
// import { OverlayPanel } from 'primeng/overlaypanel';
interface ExportColumn {
  title: string;
  dataKey: string;
}
@Component({
  standalone: false,
  selector: 'msn-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridComponent extends AppComponentBase implements OnInit {
  @ViewChild('op') overlayPanel!: OverlayPanel;
  @ViewChild('multiSelect') multiSelect!: MultiSelect;
  @Input() columns: ITableHeader[] = [];
  @Input() data: any[];
  @Input() actions: MenuItem[] = [];
  @Input() selectedRecords: any[] = [];
  @Input() pageIndex: number = 0;
  @Input() paginator: boolean = true;
  @Input() sortable: boolean = true;
  @Input() canSelect: boolean = false;
  @Input() showGroupMenu: boolean = false;
  @Input() isRowClickable: boolean = true;
  @Input() pageSize: number = 6;
  @Input() rowsPerPageOptions: number[] = [5, 10, 20, 50, 100, 200];
  @Input() totalRecordsLength: number;
  @Input() selectionMode: string;
  @Input() styleClass: string = 'p-datatable-gridlines';
  @Input() moduleTitle: string;
  @Input() module!: string;
  @Input() loading!: boolean;
  @Input() isExportExcel!: boolean;
  @Input() exportHandler?: () => void;

  @Input() isDataInput: boolean = false;
  @Input() isAdvancedFilter: boolean = false;

  @Input() actionButtonClass: string = 'aube-btn-outline rounded-circle btn-color-lightblue';
  scrollable: boolean = true;
  @Input() responsive: boolean = false;

  @Output() filterChanged: EventEmitter<{
    [s: string]: FilterMetadata[];
  }> = new EventEmitter<{ [s: string]: FilterMetadata[] }>();

  @Output() dataChanged: EventEmitter<{
    data;
  }> = new EventEmitter<{ data }>();

  @Output() showGroupMenuChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() pageIndexChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() pageSizeChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() sortChanged: EventEmitter<SortMeta[]> = new EventEmitter<SortMeta[]>();

  @Output() selectedRecordsChanged: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() rowClicked: EventEmitter<any> = new EventEmitter<any>();
  backendUrl: string | null = null;
  @ViewChild('ADVGrid') ADVGrid: Table;
  @ViewChildren(EnumFilterComponent)
  enumFilters: QueryList<EnumFilterComponent>;

  selectedColumns: any[] = [];
  hiddenColumns: any[] = [];
  groupActions: any[] = [];
  dataList: any[];
  groupedData: any;
  recordKey: string = '';
  currentPageReportTemplate: string = '';
  groupColumnsOptions: any[];
  propertyGetters: ((item: any) => any)[]; // usedIn Grouping
  selectedGroupByCol: any[];
  viewMood: TableViewMood = TableViewMood.RecordsView;
  selectedAction: null;
  TableHeaderType = TableHeaderType;
  TableViewMood = TableViewMood;
  paymentProofVisible = false;
  paymentProofUrl: string | null = null;

  constructor(
    inject: Injector,
    private injector: Injector,
    private config: PrimeNGConfig,
    private localizationService: LocalizationService,
    private toasterService: ToasterService,
    private cdr: ChangeDetectorRef
  ) {
    super(inject);
    /**
     * intuitional
     */
  }
  exportColumns!: ExportColumn[];

  ngOnInit(): void {
    this.dataList = JSON.parse(JSON.stringify(this.data));
    debugger
    this.gerateUserColumns();
    this.setPaginationTitle();
    this.setGroupAction();
    this.fillColumnsList();
    this.getRecordKey();
    this.getGroupByColumnOptions();
    this.getFilterMenuTranslation();
    this.backendUrl = environment.oAuthConfig.issuer;
    this.exportColumns = this.columns.map((col) => ({ title: col.name, dataKey: col.field }));

  }
    private detectedChanges: boolean = false; // إضافة متغير لتتبع التغييرات

  ngAfterViewInit(): void {
    if (!this.detectedChanges) {
      this.detectedChanges = true;
      this.listeningGroupingMenu();  // نبدأ في تنفيذ المنطق هنا
      setTimeout(() => {
        const inputElement = document.getElementById('true');
        if (inputElement) (inputElement as HTMLInputElement).focus();
      }, 500);
    }
  }
  // ngAfterViewInit(): void {
  //   this.listeningGroupingMenu();
  //   setTimeout(() => {
  //     // get the input element and focus it
  //     const inputElement = document.getElementById('true');
  //     if (inputElement) (inputElement as HTMLInputElement).focus();
  //   }, 500);
  // }
  onApproveChange(col: any, id, value): void {

    if (id) {
      let data: any = { id, value };
      col.command(data);
    }
  }
  rowData(col: any, id, value): void {
debugger
    if (id) {
      let data: any = { id, value };
      col.command(data);
    }
  }
  setGroupAction() {
    this.groupActions.push({ title: this.l('Actions'), value: null });
    this.actions.forEach(element => {
      if (element.showInList == true) {
        this.groupActions.push(element);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['data']?.firstChange && changes['data']?.currentValue) {
      this.dataList = JSON.parse(JSON.stringify(changes['data'].currentValue));
      this.setPaginationTitle();

      if (this.viewMood === TableViewMood.GroupView) {
        this.dataList = groupBy(this.data, [...this.propertyGetters]) as any;
      }
    }
  }

  getFilterMenuTranslation(): void {
    this.localizationService.get('primeng.filter').subscribe((res: any) => {
      this.config.setTranslation(res);
    });
  }

  onPageChange(event: { first: number; rows: number }): void {
    let pageIndex = event.first / event.rows;
    this.pageSizeChange.emit(event.rows);
    this.pageIndexChange.emit(pageIndex);
  }

  onFilterChange(event: {
    filteredValue: any[];
    filters: { [s: string]: FilterMetadata[] };
  }): void {

    Object.keys(event.filters).forEach((filterKey) => {
      //if filterKey continer from like projectCountFrom will split from  or to  before check   

      const  baseKey =  filterKey.includes('From') || filterKey.includes('To') ?filterKey.split(/From|To/)[0]:filterKey;
      
      const column = this.columns.find((col) => col.field === baseKey);

      if (column && column.relatedTableName) {
        const filter = event.filters[filterKey];
        if (filter) {
          (filter as any).relatedTableName = column.relatedTableName;
        }
      }
    });

    
    this.filterChanged.emit(event.filters);
  }

  clearFilters(): void {
    this.ADVGrid.clear();
    this.onFilterChange({ filteredValue: [], filters: {} });
  }

  onSort(event: { multisortmeta: SortMeta[] }): void {
    if (this.isColumnSortable(event.multisortmeta[0]?.field))
      this.sortChanged.emit(event.multisortmeta);
  }

  onExportRequested(): void {
    if (this.exportHandler) {
      this.exportHandler();
      return;
    }

    if (this.ADVGrid) {
      this.ADVGrid.exportCSV();
    }
  }

  isColumnSortable(felid: string) {
    const col = this.columns.find(col => col.field === felid);
    return !col?.removeSorting;
  }

  onRowClicked(event: number | string): void {
    this.rowClicked.emit(event);
  }

  onSelectionChange(event: any): void {
    if (hasProperty(this.selectedRecords, 'key') && this.viewMood === TableViewMood.GroupView)
      this.selectedRecords = JSON.parse(JSON.stringify(this.data));
    this.selectedRecordsChanged.emit(this.selectedRecords);
  }

  onTakeCommand(item: MenuItem, colField, recordData: any, recordKey: string): void {
    if (recordKey == 'down') {
      recordData[colField] += 1;
    } else if (recordKey == 'up') {
      recordData[colField] -= 1;
    }

    if (recordData.id && item.command) item.command(recordData);
  }

  onTakeAction(item: MenuItem, recordData: any): void {
    
    if (recordData.id && item.command) item.command(recordData);
  }
  openPaymentProof(rowData: any, event?: Event): void {
    event?.stopPropagation();
    if (!this.isBankTransfer(rowData)) {
      return;
    }
    const fullUrl = this.buildProofUrl(rowData);
    if (!fullUrl) {
      return;
    }
    this.paymentProofUrl = fullUrl;
    this.paymentProofVisible = true;
  }
  handleActionChange(event: any): void {
    if (this.selectedRecords.length > 0) {
      event.value.command(this.selectedRecords)
        this.selectedRecords = [];
    } else {
      this.toasterService.error(this.l('PleaseSelectColumn'));
    }
    //resete the p-dropdown groupActions
    this.selectedAction = null;
    // this.cdr.detectChanges();
  }

  // onDataChange( col :any,id,value): void {
  //   if (id && value){
  //     let data: any = { id, value };
  //     col.command(data);
  //   }

  // }

  // rowLoading:boolean = false;
  // onDataChange(value): void {
  //   this.rowLoading = true;

  //     this.dataChanged.emit(value);
  //     timer(1000).subscribe(() => {
  //       this.rowLoading = false;
  //     })
  // }
  rowLoadingMap: { [key: string]: boolean } = {};
  rowLoaded: { [key: string]: boolean } = {};

  // onDataChange(rowData, colField, isrequired): void {

  //   // || rowData[colField].trim() === ''
  //   if (!rowData[colField] && isrequired) {
  //     this.reset();
  //     this.toasterService.error(this.l("ThisFieldCan'tBeEmpty"));
  //     return;
  //   }

  //   const rowKey = `${rowData.id}-${colField}`; // Unique key for the row and column
  //   this.rowLoadingMap[rowKey] = true;

  //   this.dataChanged.emit(rowData);

  //   timer(1000).subscribe(() => {
  //     this.rowLoadingMap[rowKey] = false;
  //     this.rowLoaded[rowKey] = true;

  //     timer(1000).subscribe(() => {
  //       this.rowLoaded[rowKey] = false;
  //     });
  //   });
  // }

  onDataChange(rowData, colField, isrequired): void {
    debugger
  // منع التحديثات غير الضرورية
  if (!rowData[colField] && isrequired) {
    this.reset();
    this.toasterService.error(this.l("ThisFieldCan'tBeEmpty"));
    return;
  }

  const rowKey = `${rowData.id}-${colField}`; // تعريف مفتاح فريد للصف و العمود
  this.rowLoadingMap[rowKey] = true;

  this.dataChanged.emit(rowData);

  // باستخدام timer لتأخير عملية الكشف عن التغييرات
  timer(1000).subscribe(() => {
    this.rowLoadingMap[rowKey] = false;
    this.rowLoaded[rowKey] = true;

    // نضيف تأخير آخر لإزالة الحالة المحملة بعد 1 ثانية
    timer(1000).subscribe(() => {
      this.rowLoaded[rowKey] = false;
    });
  });
}
  isfocus(value) {
    return value;
  }
  isRowLoading(rowData, colField): boolean {
    const rowKey = `${rowData.id}-${colField}`;
    var res = this.rowLoadingMap[rowKey] || false;
    return res;
  }
  isRowLoaded(rowData, colField): boolean {
    const rowKey = `${rowData.id}-${colField}`;
    return this.rowLoaded[rowKey] || false;
  }
  onStatusChange(col: any, id, value): void {
    if (id == null || value === undefined || value === null || !col.command) {
      return;
    }

    col.command({ id, value });
  }

  getRecordKey(): void {
    this.recordKey = this.columns.find(col => col.recordKey)?.field || '';
  }

  getGroupByColumnOptions(): void {
    this.groupColumnsOptions = this.columns.filter(item => item.canGroup);
  }

  trackByIndex(index: number): number {
    return index;
  }

  onGroupByChanged(col: ITableHeader[]): void {
    if (!col.length) {
      this.reset();
      return;
    }
    this.propertyGetters = col.map((key: any) => {
      return (item: any) => item[key.field];
    });

    this.dataList = groupBy(this.data, [...this.propertyGetters]) as any;
    this.viewMood = TableViewMood.GroupView;
  }

  reset(): void {
    debugger
    this.selectedGroupByCol = [];
    this.viewMood = TableViewMood.RecordsView;
    this.ADVGrid.reset();
    this.enumFilters.forEach(enumFilter => {
      enumFilter.reset();
    });
  }

  getEnumKeyByEnumValue(enumObject: { [key: string]: string }, enumValue: string): string {
    const key = Object.keys(enumObject).find(k => enumObject[k] == enumValue);
    return key !== undefined ? key : '';
  }

  setPaginationTitle(): void {
    if (this.totalRecordsLength) {
      this.currentPageReportTemplate = `${this.totalRecordsLength
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}  ${this.moduleTitle}`;
    } else {
      // Handle the case where `this.totalRecordsLength` is undefined
      this.currentPageReportTemplate = `0  ${this.moduleTitle}`;
    }
  }
  fillColumnsList() {
    this.selectedColumns = this.columns.filter(column => !column.hidden);
    this.hiddenColumns = this.columns.filter(column => column.hidden);
  }
  onColumnToggle(event: any) {
    let selectedColumn = this.columns.find(a => a.field == event.itemValue.field);
    selectedColumn.hidden = !selectedColumn.hidden;

    this.fillColumnsList();
  }


  getPipeTransform(value: any, pipeName: string): string {

    const pipe = this.injector.get<any>(pipeName as any, null);
    return pipe ? pipe.transform(value) : '';
  }

  // getPipeTransform(value: any , pipeName :any): string {
  //  
  //   if (!pipeName) return '';

  //   const pipe = this.injector.get<any>( pipeName as any, null);
  //   return pipe ? pipe.transform(value) : '';
  // }


  gerateUserColumns() {
    const userColumns = [
      {
        field: 'creatorName',
        name: this.l('CreatedBy'),
        type: TableHeaderType.Text,
        removeFlitter: false,
        removeSorting: true,
        disabled: true,
        required: false,
        hidden: true,
      },

      {
        field: 'creationTime',
        name: this.l('CreatedOn'),
        type: TableHeaderType.Date,
        removeFlitter: false,
        removeSorting: false,
        disabled: true,
        required: false,
        hidden: true,
        isDate: true,
      },
      {
        field: 'lastModifierName',
        name: this.l('ModifiedBy'),
        type: TableHeaderType.Text,
        removeFlitter: false,
        removeSorting: true,
        disabled: true,
        required: false,
        hidden: true,
      },
      {
        field: 'lastModificationTime',
        name: this.l('ModifiedOn'),
        type: TableHeaderType.Date,
        removeFlitter: false,
        removeSorting: false,
        disabled: true,
        required: false,
        hidden: true,
        isDate: true,
      },

      {
        field: ' ',
        name: this.l(' '),
        hidden: true,
        alwaysVisible: true,
      },
    ];

    const existingFields = new Set(this.columns.map(column => column.field));
    const columnsToAdd = userColumns.filter(
      column => !!column.field?.trim() && !existingFields.has(column.field)
    );
    this.columns = [...this.columns, ...columnsToAdd];
  }

  listeningGroupingMenu(): void {
    const groupingModal = document.getElementById('GroupingMenu');
    const togglerButton = document.getElementById('GroupingMenuToggler');
    document.addEventListener('click', (event: any) => {
      setTimeout(() => {
        if (event.target === togglerButton || event.target.closest('#GroupingMenuToggler')) return;
        if (groupingModal && !groupingModal.contains(event.target)) {
          groupingModal.classList.remove('active');
        }
      }, 0);
    });
  }

  openMultiSelect(): void {
    setTimeout(() => {
      if (this.multiSelect) {
        this.multiSelect.show(); // Open MultiSelect dropdown
      }
    }, 200); // Small delay to ensure the overlay panel is fully opened
  }
  // // // Function to toggle OverlayPanel
  // showOverlay(event: Event): void {
  //   this.overlayPanel.toggle(event);
  //  // this.openMultiSelect()
  // }
  getColumnNames(rowData: any, col: any): void {
    debugger
    let x = rowData[col.field].map((item: any) => item.name).join(',');
    return x;
  }

  private isBankTransfer(rowData: any): boolean {
    const method = (rowData?.paymentMethod || '').toString().toLowerCase();
    return method === 'banktransfer';
  }

  private buildProofUrl(rowData: any): string | null {
    const url = rowData?.paymentUrl as string | undefined;
    const paymentId = rowData?.paymentId as string | undefined;
    const maybeUrl = url || (paymentId ? `/adFazSYS/host/partnerCertificates/${paymentId}` : '');
    if (!maybeUrl) {
      return null;
    }
    return this.buildMediaUrl(maybeUrl);
  }

  buildMediaUrl(path?: string | null): string {
    if (!path) {
      return '';
    }

    if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) {
      return path;
    }

    const prefix = this.backendUrl ?? '';
    const normalizedPrefix = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
    return `${normalizedPrefix}/${path.replace(/^\//, '')}`;
  }

}
