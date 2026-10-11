import { ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { ToasterService } from '@abp/ng.theme.shared';
import { FilterMetadata, MenuItem, SortMeta } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/shared/app-component-base';
import { TableHeaderType } from 'src/app/sharedFeatures/enum/table/table-header-type';
import { ITableHeader } from 'src/app/sharedFeatures/models/itable-header';
import { Pagination } from 'src/app/sharedFeatures/models/pagination.model';
import { ClientsApiService } from '../../services/clients-api.service';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  standalone: false,
})
export class ClientsListComponent extends AppComponentBase implements OnInit {
  tableColumns: ITableHeader[] = [];
  tableActions: MenuItem[] = [];
  isLoading = true;
  dataList: any[] = [];
  loader = false;
  sorting = 'CreationTime desc';
  dialogVisible = false;
  editingClientId = 0;

  constructor(
    injector: Injector,
    private readonly clientsApi: ClientsApiService,
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
        field: 'name',
        name: this.l('Clients:Name'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        isClickable: this.isGranted('Thabat.Clients.Edit'),
        minWidth: '180px',
      },
      {
        field: 'emailAddress',
        name: this.l('Clients:Email'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        minWidth: '180px',
      },
      {
        field: 'phoneNumber',
        name: this.l('Clients:PhoneNumber'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        minWidth: '140px',
      },
      {
        field: 'isActive',
        name: this.l('Clients:IsActive'),
        type: TableHeaderType.Enum,
        alwaysVisible: true,
        disabled: !this.isGranted('Thabat.Clients.Edit'),
        removeSorting: false,
        extraData: { asSwitch: true },
        command: (event: any): void => this.changeStatus(event),
        enum: {
          [this.l('Clients:Active')]: true,
          [this.l('Clients:Inactive')]: false,
        },
      },
      {
        field: 'creationTime',
        name: this.l('Clients:CreationTime'),
        type: TableHeaderType.Date,
        alwaysVisible: true,
        removeFlitter: true,
        minWidth: '180px',
      },
    ];
  }

  generateTableActions(): void {
    this.tableActions = [
      {
        visible: this.isGranted('Thabat.Clients.Edit'),
        iconClass: 'pi pi-pencil',
        label: this.l('Clients:Edit'),
        command: (event: any): void => {
          this.openEdit(event.id);
        },
      },
      {
        visible: this.isGranted('Thabat.Clients.Delete'),
        iconClass: 'pi pi-trash',
        label: this.l('Clients:Delete'),
        command: (event: any): void => {
          this.deleteClient(event);
        },
      },
    ];
  }

  openCreate(): void {
    this.editingClientId = 0;
    this.dialogVisible = true;
  }

  openEdit(id: number): void {
    if (!id || !this.isGranted('Thabat.Clients.Edit')) {
      return;
    }

    this.editingClientId = id;
    this.dialogVisible = true;
  }

  changeStatus(event: { id: number; value: boolean }): void {
    const client = this.dataList.find(item => item.id === event.id);
    if (!client) {
      return;
    }

    const previous = !event.value;
    this.clientsApi
      .update(event.id, {
        name: client.name ?? '',
        emailAddress: client.emailAddress ?? '',
        phoneNumber: client.phoneNumber ?? '',
        isActive: event.value,
      })
      .subscribe({
        next: () => this.toaster.success(this.l('Clients:Saved')),
        error: error => {
          client.isActive = previous;
          this.toaster.error(error?.error?.error?.message || this.l('Clients:SaveFailed'));
          this.cdr.detectChanges();
        },
      });
  }

  onClientSaved(): void {
    this.dialogVisible = false;
    this.editingClientId = 0;
    this.getRecords();
  }

  getRecords(): void {
    this.loader = true;
    const pageIndex = this.fillter?.pagination?.pageIndex ?? 0;
    const pageSize = this.fillter?.pagination?.pageSize ?? 10;

    this.clientsApi
      .getPaged({
        skipCount: pageIndex * pageSize,
        maxResultCount: pageSize,
        sorting: this.sorting,
        columnFilters: this.baseFilterMetaData ?? [],
      })
      .pipe(finalize(() => {
        this.loader = false;
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: result => {
          this.dataList = result?.items ?? [];
          const pagination = new Pagination();
          pagination.pageIndex = pageIndex;
          pagination.pageSize = pageSize;
          pagination.totalCount = result?.totalCount ?? 0;
          pagination.getTotalCount = false;
          this.fillter.pagination = this.fillter.pagination.setPaginationByInstance(pagination);
        },
        error: () => this.toaster.error(this.l('Clients:LoadFailed')),
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

  private async deleteClient(client: any): Promise<void> {
    if (!client?.id) return;

    const isConfirmed = await new Promise(resolve => {
      this.confirmationService.confirm({
        message: this.l('Clients:DeleteConfirmation').replace('{0}', client.name || ''),
        header: this.l('Clients:Delete'),
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: this.l('Clients:Delete'),
        rejectLabel: this.l('Clients:Cancel'),
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });

    if (!isConfirmed) return;

    this.loader = true;
    this.clientsApi.delete(client.id).subscribe({
      next: () => {
        this.toaster.success(this.l('Clients:Deleted'));
        this.getRecords();
      },
      error: error => {
        this.loader = false;
        this.toaster.error(error?.error?.error?.message || this.l('Clients:DeleteFailed'));
        this.cdr.detectChanges();
      },
    });
  }
}
