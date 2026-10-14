import { ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { ToasterService } from '@abp/ng.theme.shared';
import { FilterMetadata, MenuItem, SortMeta } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/shared/app-component-base';
import { TableHeaderType } from 'src/app/sharedFeatures/enum/table/table-header-type';
import { ITableHeader } from 'src/app/sharedFeatures/models/itable-header';
import { Pagination } from 'src/app/sharedFeatures/models/pagination.model';
import { PathsService } from 'src/app/proxy/paths';
import { TaskStage } from 'src/app/proxy/tasks';

@Component({
  selector: 'app-paths-list',
  templateUrl: './paths-list.component.html',
  standalone: false,
})
export class PathsListComponent extends AppComponentBase implements OnInit {
  tableColumns: ITableHeader[] = [];
  tableActions: MenuItem[] = [];
  isLoading = true;
  dataList: any[] = [];
  loader = false;
  sorting = 'Stage asc, Day asc';
  dialogVisible = false;
  editingPathId = 0;
  stats = {
    totalPaths: 0,
    sevenDaysCount: 0,
    thirtyDaysCount: 0,
    ninetyDaysCount: 0,
  };

  constructor(
    injector: Injector,
    private readonly pathsService: PathsService,
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
        field: 'stage',
        name: this.l('Paths:Stage'),
        type: TableHeaderType.Enum,
        alwaysVisible: true,
        disabled: true,
        minWidth: '140px',
        extraData: { asBadge: true },
        enum: {
          [this.l('Paths:Stage.SevenDays')]: TaskStage.SevenDays,
          [this.l('Paths:Stage.ThirtyDays')]: TaskStage.ThirtyDays,
          [this.l('Paths:Stage.NinetyDays')]: TaskStage.NinetyDays,
        },
      },
      {
        field: 'day',
        name: this.l('Paths:Day'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        isClickable: this.isGranted('Thabat.Paths.Edit'),
        minWidth: '90px',
      },
      {
        field: 'feelingsCount',
        name: this.l('Paths:FeelingsCount'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        removeFlitter: true,
        minWidth: '160px',
      },
      {
        field: 'challengesCount',
        name: this.l('Paths:ChallengesCount'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        removeFlitter: true,
        minWidth: '140px',
      },
      {
        field: 'tipsCount',
        name: this.l('Paths:TipsCount'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        removeFlitter: true,
        minWidth: '130px',
      },
    ];
  }

  generateTableActions(): void {
    this.tableActions = [
      {
        visible: this.isGranted('Thabat.Paths.Edit'),
        iconClass: 'pi pi-pencil',
        label: this.l('Paths:Edit'),
        command: (event: any): void => {
          this.openEdit(event.id);
        },
      },
      {
        visible: this.isGranted('Thabat.Paths.Delete'),
        iconClass: 'pi pi-trash',
        label: this.l('Paths:Delete'),
        command: (event: any): void => {
          this.deletePath(event);
        },
      },
    ];
  }

  openCreate(): void {
    this.editingPathId = 0;
    this.dialogVisible = true;
  }

  openEdit(id: number): void {
    if (!id || !this.isGranted('Thabat.Paths.Edit')) {
      return;
    }

    this.editingPathId = id;
    this.dialogVisible = true;
  }

  onPathSaved(): void {
    this.dialogVisible = false;
    this.editingPathId = 0;
    this.getRecords();
  }

  getRecords(): void {
    this.loader = true;
    const pageIndex = this.fillter?.pagination?.pageIndex ?? 0;
    const pageSize = this.fillter?.pagination?.pageSize ?? 10;

    this.pathsService
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
            totalPaths: result?.totalPaths ?? 0,
            sevenDaysCount: result?.sevenDaysCount ?? 0,
            thirtyDaysCount: result?.thirtyDaysCount ?? 0,
            ninetyDaysCount: result?.ninetyDaysCount ?? 0,
          };
          const pagination = new Pagination();
          pagination.pageIndex = pageIndex;
          pagination.pageSize = pageSize;
          pagination.totalCount = result?.totalCount ?? 0;
          pagination.getTotalCount = false;
          this.fillter.pagination = this.fillter.pagination.setPaginationByInstance(pagination);
        },
        error: () => this.toaster.error(this.l('Paths:LoadFailed')),
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

  private async deletePath(path: any): Promise<void> {
    if (!path?.id) return;

    const isConfirmed = await new Promise(resolve => {
      this.confirmationService.confirm({
        message: this.l('Paths:DeleteConfirmation').replace('{0}', String(path.day ?? '')),
        header: this.l('Paths:Delete'),
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: this.l('Paths:Delete'),
        rejectLabel: this.l('Paths:Cancel'),
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });

    if (!isConfirmed) return;

    this.loader = true;
    this.pathsService.delete(path.id).subscribe({
      next: () => {
        this.toaster.success(this.l('Paths:Deleted'));
        this.getRecords();
      },
      error: error => {
        this.loader = false;
        this.toaster.error(error?.error?.error?.message || this.l('Paths:DeleteFailed'));
        this.cdr.detectChanges();
      },
    });
  }
}
