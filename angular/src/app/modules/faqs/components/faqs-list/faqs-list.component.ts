import { ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { ToasterService } from '@abp/ng.theme.shared';
import { FilterMetadata, MenuItem, SortMeta } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/shared/app-component-base';
import { TableHeaderType } from 'src/app/sharedFeatures/enum/table/table-header-type';
import { ITableHeader } from 'src/app/sharedFeatures/models/itable-header';
import { Pagination } from 'src/app/sharedFeatures/models/pagination.model';
import { FaqsService } from 'src/app/proxy/faqs';

@Component({
  selector: 'app-faqs-list',
  templateUrl: './faqs-list.component.html',
  standalone: false,
})
export class FaqsListComponent extends AppComponentBase implements OnInit {
  tableColumns: ITableHeader[] = [];
  tableActions: MenuItem[] = [];
  isLoading = true;
  dataList: any[] = [];
  loader = false;
  sorting = 'Sort asc';
  dialogVisible = false;
  editingFaqId = 0;
  stats = {
    totalFaqs: 0,
  };

  constructor(
    injector: Injector,
    private readonly faqsService: FaqsService,
    private readonly toaster: ToasterService,
    private readonly cdr: ChangeDetectorRef
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.generateTableColumn();
    this.generateTableActions();
    this.fillter.pagination = Pagination.newPagination(0, 10, 0, false);
    this.onFilterChanged({});
  }

  generateTableColumn(): void {
    this.tableColumns = [
      {
        field: 'sort',
        name: this.l('Faqs:Sort'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        minWidth: '90px',
      },
      {
        field: 'titleAr',
        name: this.l('Faqs:TitleAr'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        isClickable: this.isGranted('Thabat.Faqs.Edit'),
        minWidth: '240px',
      },
      {
        field: 'titleEn',
        name: this.l('Faqs:TitleEn'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        minWidth: '220px',
      },
      {
        field: 'descriptionAr',
        name: this.l('Faqs:DescriptionAr'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        minWidth: '280px',
      },
    ];
  }

  generateTableActions(): void {
    this.tableActions = [
      {
        visible: this.isGranted('Thabat.Faqs.Edit'),
        iconClass: 'pi pi-pencil',
        label: this.l('Faqs:Edit'),
        command: (event: any): void => {
          this.openEdit(event.id);
        },
      },
      {
        visible: this.isGranted('Thabat.Faqs.Delete'),
        iconClass: 'pi pi-trash',
        label: this.l('Faqs:Delete'),
        command: (event: any): void => {
          this.deleteFaq(event);
        },
      },
    ];
  }

  openCreate(): void {
    this.editingFaqId = 0;
    this.dialogVisible = true;
  }

  openEdit(id: number): void {
    if (!id || !this.isGranted('Thabat.Faqs.Edit')) {
      return;
    }

    this.editingFaqId = id;
    this.dialogVisible = true;
  }

  onFaqSaved(): void {
    this.dialogVisible = false;
    this.editingFaqId = 0;
    this.getRecords();
  }

  getRecords(): void {
    this.loader = true;
    const pageIndex = this.fillter?.pagination?.pageIndex ?? 0;
    const pageSize = this.fillter?.pagination?.pageSize ?? 10;

    this.faqsService
      .getPaged({
        skipCount: pageIndex * pageSize,
        maxResultCount: pageSize,
        sorting: this.sorting,
        columnFilters: this.baseFilterMetaData ?? [],
      })
      .pipe(
        finalize(() => {
          this.loader = false;
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: result => {
          this.dataList = result?.items ?? [];
          this.stats = {
            totalFaqs: result?.totalFaqs ?? 0,
          };
          const pagination = new Pagination();
          pagination.pageIndex = pageIndex;
          pagination.pageSize = pageSize;
          pagination.totalCount = result?.totalCount ?? 0;
          pagination.getTotalCount = false;
          this.fillter.pagination = this.fillter.pagination.setPaginationByInstance(pagination);
        },
        error: () => this.toaster.error(this.l('Faqs:LoadFailed')),
      });
  }

  onSortChanged(requiredInfo: SortMeta[]): void {
    if (!requiredInfo?.length) return;
    this.sorting = this.sortHandeled(requiredInfo, 'entity');
    this.getRecords();
  }

  onPageSizeChange(size: number): void {
    this.fillter.pagination.pageSize = size;
  }

  onPageIndexChange(index: number): void {
    this.fillter.pagination.pageIndex = index;
    this.getRecords();
  }

  onFilterChanged(event: { [s: string]: FilterMetadata[] }): void {
    this.filterHandeled(event);
    this.getRecords();
  }

  onDataChanged(_: any): void {}

  private async deleteFaq(faq: any): Promise<void> {
    if (!faq?.id) return;

    const isConfirmed = await new Promise(resolve => {
      this.confirmationService.confirm({
        message: this.l('Faqs:DeleteConfirmation').replace('{0}', faq.titleAr || faq.titleEn || ''),
        header: this.l('Faqs:Delete'),
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: this.l('Faqs:Delete'),
        rejectLabel: this.l('Faqs:Cancel'),
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });

    if (!isConfirmed) return;

    this.loader = true;
    this.faqsService.delete(faq.id).subscribe({
      next: () => {
        this.toaster.success(this.l('Faqs:Deleted'));
        this.getRecords();
      },
      error: error => {
        this.loader = false;
        this.toaster.error(error?.error?.error?.message || this.l('Faqs:DeleteFailed'));
        this.cdr.detectChanges();
      },
    });
  }
}
