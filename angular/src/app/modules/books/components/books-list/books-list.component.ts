import { ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { ToasterService } from '@abp/ng.theme.shared';
import { FilterMetadata, MenuItem, SortMeta } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/shared/app-component-base';
import { TableHeaderType } from 'src/app/sharedFeatures/enum/table/table-header-type';
import { ITableHeader } from 'src/app/sharedFeatures/models/itable-header';
import { Pagination } from 'src/app/sharedFeatures/models/pagination.model';
import { BooksService } from 'src/app/proxy/books';

@Component({
  selector: 'app-books-list',
  templateUrl: './books-list.component.html',
  standalone: false,
})
export class BooksListComponent extends AppComponentBase implements OnInit {
  tableColumns: ITableHeader[] = [];
  tableActions: MenuItem[] = [];
  isLoading = true;
  dataList: any[] = [];
  loader = false;
  sorting = 'CreationTime desc';
  dialogVisible = false;
  editingBookId = 0;
  mediaDialogVisible = false;
  mediaBookId = 0;
  stats = {
    totalBooks: 0,
    availableBooks: 0,
    freeBooks: 0,
    relapseBooks: 0,
  };

  constructor(
    injector: Injector,
    private readonly booksService: BooksService,
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
        field: 'coverImage',
        name: this.l('Books:CoverImage'),
        type: TableHeaderType.Pic,
        alwaysVisible: true,
        removeFlitter: true,
        removeSorting: true,
        minWidth: '88px',
        width: 0.5,
      },
      {
        field: 'nameAr',
        name: this.l('Books:NameAr'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        isClickable: this.isGranted('Thabat.Books.Edit'),
        minWidth: '180px',
      },
      {
        field: 'nameEn',
        name: this.l('Books:NameEn'),
        type: TableHeaderType.Text,
        alwaysVisible: true,
        minWidth: '180px',
      },
      {
        field: 'isFree',
        name: this.l('Books:IsFree'),
        type: TableHeaderType.Enum,
        alwaysVisible: true,
        disabled: !this.isGranted('Thabat.Books.Edit'),
        extraData: { asSwitch: true },
        command: (event: any): void => this.changeFlag(event, 'isFree'),
        enum: {
          [this.l('Books:Yes')]: true,
          [this.l('Books:No')]: false,
        },
      },
      {
        field: 'isRelapse',
        name: this.l('Books:IsRelapse'),
        type: TableHeaderType.Enum,
        alwaysVisible: true,
        disabled: !this.isGranted('Thabat.Books.Edit'),
        extraData: { asSwitch: true },
        command: (event: any): void => this.changeFlag(event, 'isRelapse'),
        enum: {
          [this.l('Books:Yes')]: true,
          [this.l('Books:No')]: false,
        },
      },
    ];
  }

  generateTableActions(): void {
    this.tableActions = [
      {
        visible: this.isGranted('Thabat.Books.Edit'),
        iconClass: 'pi pi-pencil',
        label: this.l('Books:Edit'),
        command: (event: any): void => {
          this.openEdit(event.id);
        },
      },
      {
        visible: this.isGranted('Thabat.Books.Edit'),
        iconClass: 'pi pi-images',
        label: this.l('Books:ManageMedia'),
        command: (event: any): void => {
          this.openMedia(event.id);
        },
      },
      {
        visible: this.isGranted('Thabat.Books.Delete'),
        iconClass: 'pi pi-trash',
        label: this.l('Books:Delete'),
        command: (event: any): void => {
          this.deleteBook(event);
        },
      },
    ];
  }

  openCreate(): void {
    this.editingBookId = 0;
    this.dialogVisible = true;
  }

  openEdit(id: number): void {
    if (!id || !this.isGranted('Thabat.Books.Edit')) {
      return;
    }

    this.editingBookId = id;
    this.dialogVisible = true;
  }

  openMedia(id: number): void {
    if (!id || !this.isGranted('Thabat.Books.Edit')) {
      return;
    }

    this.mediaBookId = id;
    this.mediaDialogVisible = true;
  }

  onMediaDialogClosed(): void {
    this.mediaDialogVisible = false;
    this.mediaBookId = 0;
    this.getRecords();
  }

  changeFlag(event: { id: number; value: boolean }, field: 'isFree' | 'isRelapse'): void {
    const book = this.dataList.find(item => item.id === event.id);
    if (!book) {
      return;
    }

    const previous = !event.value;
    this.booksService
      .update(event.id, {
        nameAr: book.nameAr ?? '',
        nameEn: book.nameEn ?? undefined,
        coverImage: book.coverImage ?? undefined,
        isFree: field === 'isFree' ? event.value : !!book.isFree,
        isRelapse: field === 'isRelapse' ? event.value : !!book.isRelapse,
        mediaItems: undefined,
      })
      .subscribe({
        next: () => {
          book[field] = event.value;
          this.applyStatsFlagDelta(field, previous, event.value);
          this.toaster.success(this.l('Books:Saved'));
          this.cdr.detectChanges();
        },
        error: error => {
          book[field] = previous;
          this.toaster.error(error?.error?.error?.message || this.l('Books:SaveFailed'));
          this.cdr.detectChanges();
        },
      });
  }

  private applyStatsFlagDelta(
    field: 'isFree' | 'isRelapse',
    previous: boolean,
    next: boolean
  ): void {
    if (previous === next) {
      return;
    }

    const delta = next ? 1 : -1;
    if (field === 'isFree') {
      this.stats = {
        ...this.stats,
        freeBooks: Math.max(0, this.stats.freeBooks + delta),
      };
      return;
    }

    this.stats = {
      ...this.stats,
      relapseBooks: Math.max(0, this.stats.relapseBooks + delta),
    };
  }

  onBookSaved(): void {
    this.dialogVisible = false;
    this.editingBookId = 0;
    this.getRecords();
  }

  getRecords(): void {
    this.loader = true;
    const pageIndex = this.fillter?.pagination?.pageIndex ?? 0;
    const pageSize = this.fillter?.pagination?.pageSize ?? 10;

    this.booksService
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
            totalBooks: result?.totalBooks ?? 0,
            availableBooks: result?.availableBooks ?? 0,
            freeBooks: result?.freeBooks ?? 0,
            relapseBooks: result?.relapseBooks ?? 0,
          };
          const pagination = new Pagination();
          pagination.pageIndex = pageIndex;
          pagination.pageSize = pageSize;
          pagination.totalCount = result?.totalCount ?? 0;
          pagination.getTotalCount = false;
          this.fillter.pagination = this.fillter.pagination.setPaginationByInstance(pagination);
        },
        error: () => this.toaster.error(this.l('Books:LoadFailed')),
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

  private async deleteBook(book: any): Promise<void> {
    if (!book?.id) return;

    const isConfirmed = await new Promise(resolve => {
      this.confirmationService.confirm({
        message: this.l('Books:DeleteConfirmation').replace('{0}', book.nameAr || book.nameEn || ''),
        header: this.l('Books:Delete'),
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: this.l('Books:Delete'),
        rejectLabel: this.l('Books:Cancel'),
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });

    if (!isConfirmed) return;

    this.loader = true;
    this.booksService.delete(book.id).subscribe({
      next: () => {
        this.toaster.success(this.l('Books:Deleted'));
        this.getRecords();
      },
      error: error => {
        this.loader = false;
        this.toaster.error(error?.error?.error?.message || this.l('Books:DeleteFailed'));
        this.cdr.detectChanges();
      },
    });
  }
}
