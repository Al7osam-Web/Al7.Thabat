import { ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { ToasterService } from '@abp/ng.theme.shared';
import { FilterMetadata, MenuItem, SortMeta } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/shared/app-component-base';
import { TableHeaderType } from 'src/app/sharedFeatures/enum/table/table-header-type';
import { ITableHeader } from 'src/app/sharedFeatures/models/itable-header';
import { Pagination } from 'src/app/sharedFeatures/models/pagination.model';
import { SurveyQuestionsService } from 'src/app/proxy/surveys';

@Component({
  selector: 'app-survey-questions-list',
  templateUrl: './survey-questions-list.component.html',
  standalone: false,
})
export class SurveyQuestionsListComponent extends AppComponentBase implements OnInit {
  tableColumns: ITableHeader[] = [];
  tableActions: MenuItem[] = [];
  isLoading = true;
  dataList: any[] = [];
  loader = false;
  sorting = 'Sort asc';
  dialogVisible = false;
  editingQuestionId = 0;
  stats = {
    totalQuestions: 0,
    totalAnswers: 0,
  };

  constructor(
    injector: Injector,
    private readonly surveyQuestionsService: SurveyQuestionsService,
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
        name: this.l('SurveyQuestions:Sort'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        minWidth: '90px',
      },
      {
        field: 'titleAr',
        name: this.l('SurveyQuestions:TitleAr'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        isClickable: this.isGranted('Thabat.SurveyQuestions.Edit'),
        minWidth: '220px',
      },
      {
        field: 'titleEn',
        name: this.l('SurveyQuestions:TitleEn'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        minWidth: '200px',
      },
      {
        field: 'answersCount',
        name: this.l('SurveyQuestions:AnswersCount'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        removeFlitter: true,
        minWidth: '120px',
      },
    ];
  }

  generateTableActions(): void {
    this.tableActions = [
      {
        visible: this.isGranted('Thabat.SurveyQuestions.Edit'),
        iconClass: 'pi pi-pencil',
        label: this.l('SurveyQuestions:Edit'),
        command: (event: any): void => {
          this.openEdit(event.id);
        },
      },
      {
        visible: this.isGranted('Thabat.SurveyQuestions.Delete'),
        iconClass: 'pi pi-trash',
        label: this.l('SurveyQuestions:Delete'),
        command: (event: any): void => {
          this.deleteQuestion(event);
        },
      },
    ];
  }

  openCreate(): void {
    this.editingQuestionId = 0;
    this.dialogVisible = true;
  }

  openEdit(id: number): void {
    if (!id || !this.isGranted('Thabat.SurveyQuestions.Edit')) {
      return;
    }

    this.editingQuestionId = id;
    this.dialogVisible = true;
  }

  onQuestionSaved(): void {
    this.dialogVisible = false;
    this.editingQuestionId = 0;
    this.getRecords();
  }

  getRecords(): void {
    this.loader = true;
    const pageIndex = this.fillter?.pagination?.pageIndex ?? 0;
    const pageSize = this.fillter?.pagination?.pageSize ?? 10;

    this.surveyQuestionsService
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
            totalQuestions: result?.totalQuestions ?? 0,
            totalAnswers: result?.totalAnswers ?? 0,
          };
          const pagination = new Pagination();
          pagination.pageIndex = pageIndex;
          pagination.pageSize = pageSize;
          pagination.totalCount = result?.totalCount ?? 0;
          pagination.getTotalCount = false;
          this.fillter.pagination = this.fillter.pagination.setPaginationByInstance(pagination);
        },
        error: () => this.toaster.error(this.l('SurveyQuestions:LoadFailed')),
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

  private async deleteQuestion(question: any): Promise<void> {
    if (!question?.id) return;

    const isConfirmed = await new Promise(resolve => {
      this.confirmationService.confirm({
        message: this.l('SurveyQuestions:DeleteConfirmation').replace(
          '{0}',
          question.titleAr || question.titleEn || ''
        ),
        header: this.l('SurveyQuestions:Delete'),
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: this.l('SurveyQuestions:Delete'),
        rejectLabel: this.l('SurveyQuestions:Cancel'),
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });

    if (!isConfirmed) return;

    this.loader = true;
    this.surveyQuestionsService.delete(question.id).subscribe({
      next: () => {
        this.toaster.success(this.l('SurveyQuestions:Deleted'));
        this.getRecords();
      },
      error: error => {
        this.loader = false;
        this.toaster.error(error?.error?.error?.message || this.l('SurveyQuestions:DeleteFailed'));
        this.cdr.detectChanges();
      },
    });
  }
}
