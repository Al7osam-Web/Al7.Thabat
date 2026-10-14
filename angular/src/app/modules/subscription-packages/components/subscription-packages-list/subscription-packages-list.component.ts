import { ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { ToasterService } from '@abp/ng.theme.shared';
import { FilterMetadata, MenuItem, SortMeta } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/shared/app-component-base';
import { TableHeaderType } from 'src/app/sharedFeatures/enum/table/table-header-type';
import { ITableHeader } from 'src/app/sharedFeatures/models/itable-header';
import { Pagination } from 'src/app/sharedFeatures/models/pagination.model';
import { SubscriptionPackageDto, SubscriptionPackagesService, SubscriptionPeriod } from 'src/app/proxy/subscriptions';

@Component({
  selector: 'app-subscription-packages-list',
  templateUrl: './subscription-packages-list.component.html',
  standalone: false,
})
export class SubscriptionPackagesListComponent extends AppComponentBase implements OnInit {
  tableColumns: ITableHeader[] = [];
  tableActions: MenuItem[] = [];
  isLoading = true;
  dataList: any[] = [];
  loader = false;
  sorting = 'Sort asc';
  dialogVisible = false;
  editingPackageId = 0;
  stats = {
    totalPackages: 0,
    yearlyCount: 0,
    threeMonthsCount: 0,
    monthlyCount: 0,
  };

  constructor(
    injector: Injector,
    private readonly packagesService: SubscriptionPackagesService,
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
        field: 'period',
        name: this.l('SubscriptionPackages:Period'),
        type: TableHeaderType.Enum,
        alwaysVisible: true,
        disabled: true,
        minWidth: '130px',
        extraData: { asBadge: true },
        enum: {
          [this.l('SubscriptionPackages:Period.Yearly')]: SubscriptionPeriod.Yearly,
          [this.l('SubscriptionPackages:Period.ThreeMonths')]: SubscriptionPeriod.ThreeMonths,
          [this.l('SubscriptionPackages:Period.Monthly')]: SubscriptionPeriod.Monthly,
        },
      },
      {
        field: 'nameAr',
        name: this.l('SubscriptionPackages:NameAr'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        isClickable: this.isGranted('Thabat.SubscriptionPackages.Edit'),
        minWidth: '180px',
      },
      {
        field: 'price',
        name: this.l('SubscriptionPackages:Price'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        minWidth: '120px',
      },
      {
        field: 'billedPrice',
        name: this.l('SubscriptionPackages:BilledPrice'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        minWidth: '130px',
      },
      {
        field: 'originalPrice',
        name: this.l('SubscriptionPackages:OriginalPrice'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        minWidth: '140px',
      },
      {
        field: 'isFeatured',
        name: this.l('SubscriptionPackages:IsFeatured'),
        type: TableHeaderType.Enum,
        alwaysVisible: true,
        disabled: !this.isGranted('Thabat.SubscriptionPackages.Edit'),
        extraData: { asSwitch: true },
        command: (event: any): void => this.changeFeatured(event),
        enum: {
          [this.l('SubscriptionPackages:Yes')]: true,
          [this.l('SubscriptionPackages:No')]: false,
        },
      },
    ];
  }

  generateTableActions(): void {
    this.tableActions = [
      {
        visible: this.isGranted('Thabat.SubscriptionPackages.Edit'),
        iconClass: 'pi pi-pencil',
        label: this.l('SubscriptionPackages:Edit'),
        command: (event: any): void => {
          this.openEdit(event.id);
        },
      },
      {
        visible: this.isGranted('Thabat.SubscriptionPackages.Delete'),
        iconClass: 'pi pi-trash',
        label: this.l('SubscriptionPackages:Delete'),
        command: (event: any): void => {
          this.deletePackage(event);
        },
      },
    ];
  }

  openCreate(): void {
    this.editingPackageId = 0;
    this.dialogVisible = true;
  }

  openEdit(id: number): void {
    if (!id || !this.isGranted('Thabat.SubscriptionPackages.Edit')) {
      return;
    }

    this.editingPackageId = id;
    this.dialogVisible = true;
  }

  changeFeatured(event: { id: number; value: boolean }): void {
    const item = this.dataList.find(row => row.id === event.id);
    if (!item) {
      return;
    }

    const previous = !event.value;
    this.packagesService
      .update(event.id, this.toInput({ ...item, isFeatured: event.value }))
      .subscribe({
        next: () => {
          item.isFeatured = event.value;
          this.toaster.success(this.l('SubscriptionPackages:Saved'));
          this.cdr.detectChanges();
        },
        error: error => {
          item.isFeatured = previous;
          this.toaster.error(error?.error?.error?.message || this.l('SubscriptionPackages:SaveFailed'));
          this.cdr.detectChanges();
        },
      });
  }

  onPackageSaved(): void {
    this.dialogVisible = false;
    this.editingPackageId = 0;
    this.getRecords();
  }

  getRecords(): void {
    this.loader = true;
    const pageIndex = this.fillter?.pagination?.pageIndex ?? 0;
    const pageSize = this.fillter?.pagination?.pageSize ?? 10;

    this.packagesService
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
            totalPackages: result?.totalPackages ?? 0,
            yearlyCount: result?.yearlyCount ?? 0,
            threeMonthsCount: result?.threeMonthsCount ?? 0,
            monthlyCount: result?.monthlyCount ?? 0,
          };
          const pagination = new Pagination();
          pagination.pageIndex = pageIndex;
          pagination.pageSize = pageSize;
          pagination.totalCount = result?.totalCount ?? 0;
          pagination.getTotalCount = false;
          this.fillter.pagination = this.fillter.pagination.setPaginationByInstance(pagination);
        },
        error: () => this.toaster.error(this.l('SubscriptionPackages:LoadFailed')),
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

  private toInput(item: SubscriptionPackageDto) {
    return {
      nameAr: item.nameAr ?? '',
      nameEn: item.nameEn,
      descriptionAr: item.descriptionAr,
      descriptionEn: item.descriptionEn,
      period: item.period as SubscriptionPeriod,
      price: item.price,
      billedPrice: item.billedPrice,
      originalPrice: item.originalPrice,
      sort: item.sort,
      isFeatured: !!item.isFeatured,
    };
  }

  private async deletePackage(item: any): Promise<void> {
    if (!item?.id) return;

    const isConfirmed = await new Promise(resolve => {
      this.confirmationService.confirm({
        message: this.l('SubscriptionPackages:DeleteConfirmation').replace(
          '{0}',
          item.nameAr || item.nameEn || ''
        ),
        header: this.l('SubscriptionPackages:Delete'),
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: this.l('SubscriptionPackages:Delete'),
        rejectLabel: this.l('SubscriptionPackages:Cancel'),
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });

    if (!isConfirmed) return;

    this.loader = true;
    this.packagesService.delete(item.id).subscribe({
      next: () => {
        this.toaster.success(this.l('SubscriptionPackages:Deleted'));
        this.getRecords();
      },
      error: error => {
        this.loader = false;
        this.toaster.error(error?.error?.error?.message || this.l('SubscriptionPackages:DeleteFailed'));
        this.cdr.detectChanges();
      },
    });
  }
}
