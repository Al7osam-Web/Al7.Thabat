import { ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { ToasterService } from '@abp/ng.theme.shared';
import { FilterMetadata, MenuItem, SortMeta } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/shared/app-component-base';
import { TableHeaderType } from 'src/app/sharedFeatures/enum/table/table-header-type';
import { ITableHeader } from 'src/app/sharedFeatures/models/itable-header';
import { Pagination } from 'src/app/sharedFeatures/models/pagination.model';
import { TaskStage, TasksService } from 'src/app/proxy/tasks';

@Component({
  selector: 'app-tasks-list',
  templateUrl: './tasks-list.component.html',
  standalone: false,
})
export class TasksListComponent extends AppComponentBase implements OnInit {
  tableColumns: ITableHeader[] = [];
  tableActions: MenuItem[] = [];
  isLoading = true;
  dataList: any[] = [];
  loader = false;
  sorting = 'CreationTime desc';
  dialogVisible = false;
  editingTaskId = 0;
  stats = {
    totalTasks: 0,
    sevenDaysCount: 0,
    thirtyDaysCount: 0,
    ninetyDaysCount: 0,
  };

  constructor(
    injector: Injector,
    private readonly tasksService: TasksService,
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
        name: this.l('Tasks:Stage'),
        type: TableHeaderType.Enum,
        alwaysVisible: true,
        disabled: true,
        minWidth: '140px',
        extraData: { asBadge: true },
        enum: {
          [this.l('Tasks:Stage.SevenDays')]: TaskStage.SevenDays,
          [this.l('Tasks:Stage.ThirtyDays')]: TaskStage.ThirtyDays,
          [this.l('Tasks:Stage.NinetyDays')]: TaskStage.NinetyDays,
        },
      },
      {
        field: 'day',
        name: this.l('Tasks:Day'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        minWidth: '100px',
      },
      {
        field: 'titleAr',
        name: this.l('Tasks:TitleAr'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        isClickable: this.isGranted('Thabat.Tasks.Edit'),
        minWidth: '180px',
      },
      {
        field: 'titleEn',
        name: this.l('Tasks:TitleEn'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        minWidth: '180px',
      },
      {
        field: 'subTitleAr',
        name: this.l('Tasks:SubTitleAr'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        minWidth: '160px',
      },
    ];
  }

  generateTableActions(): void {
    this.tableActions = [
      {
        visible: this.isGranted('Thabat.Tasks.Edit'),
        iconClass: 'pi pi-pencil',
        label: this.l('Tasks:Edit'),
        command: (event: any): void => {
          this.openEdit(event.id);
        },
      },
      {
        visible: this.isGranted('Thabat.Tasks.Delete'),
        iconClass: 'pi pi-trash',
        label: this.l('Tasks:Delete'),
        command: (event: any): void => {
          this.deleteTask(event);
        },
      },
    ];
  }

  openCreate(): void {
    this.editingTaskId = 0;
    this.dialogVisible = true;
  }

  openEdit(id: number): void {
    if (!id || !this.isGranted('Thabat.Tasks.Edit')) {
      return;
    }

    this.editingTaskId = id;
    this.dialogVisible = true;
  }

  onTaskSaved(): void {
    this.dialogVisible = false;
    this.editingTaskId = 0;
    this.getRecords();
  }

  getRecords(): void {
    this.loader = true;
    const pageIndex = this.fillter?.pagination?.pageIndex ?? 0;
    const pageSize = this.fillter?.pagination?.pageSize ?? 10;

    this.tasksService
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
            totalTasks: result?.totalTasks ?? 0,
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
        error: () => this.toaster.error(this.l('Tasks:LoadFailed')),
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

  private async deleteTask(task: any): Promise<void> {
    if (!task?.id) return;

    const isConfirmed = await new Promise(resolve => {
      this.confirmationService.confirm({
        message: this.l('Tasks:DeleteConfirmation').replace(
          '{0}',
          task.titleAr || task.titleEn || ''
        ),
        header: this.l('Tasks:Delete'),
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: this.l('Tasks:Delete'),
        rejectLabel: this.l('Tasks:Cancel'),
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });

    if (!isConfirmed) return;

    this.loader = true;
    this.tasksService.delete(task.id).subscribe({
      next: () => {
        this.toaster.success(this.l('Tasks:Deleted'));
        this.getRecords();
      },
      error: error => {
        this.loader = false;
        this.toaster.error(error?.error?.error?.message || this.l('Tasks:DeleteFailed'));
        this.cdr.detectChanges();
      },
    });
  }
}
