import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ToasterService } from '@abp/ng.theme.shared';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/shared/app-component-base';
import { BookDto, BooksService } from 'src/app/proxy/books';
import { MediaService } from 'src/app/proxy/media';
import {
  BookMediaContainers,
  deleteMediaFile,
  resolveMediaUrl,
  uploadMediaFile,
} from '../../services/media-upload.helper';

interface BookMediaItemView {
  key: number;
  path: string;
  sort: number;
  uploading: boolean;
  localPreviewUrl: string | null;
}

@Component({
  selector: 'app-book-media-dialog',
  templateUrl: './book-media-dialog.component.html',
  standalone: false,
})
export class BookMediaDialogComponent extends AppComponentBase implements OnChanges, OnDestroy {
  @Input() bookId = 0;
  @Output() closed = new EventEmitter<void>();

  isLoading = false;
  isUploading = false;
  isPersisting = false;
  book: BookDto | null = null;
  mediaItems: BookMediaItemView[] = [];
  private mediaKeySeq = 0;

  constructor(
    injector: Injector,
    private readonly booksService: BooksService,
    private readonly mediaService: MediaService,
    private readonly toaster: ToasterService,
    private readonly cdr: ChangeDetectorRef
  ) {
    super(injector);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['bookId'] && this.bookId > 0) {
      this.load();
    }
  }

  ngOnDestroy(): void {
    this.mediaItems.forEach(item => this.revokeLocalPreview(item));
  }

  trackByMediaKey(_: number, item: BookMediaItemView): number {
    return item.key;
  }

  getMediaUrl(item: BookMediaItemView): string | null {
    if (item.localPreviewUrl) {
      return item.localPreviewUrl;
    }

    return resolveMediaUrl(item.path);
  }

  isCover(item: BookMediaItemView): boolean {
    const cover = (this.book?.coverImage || '').trim();
    const path = (item.path || '').trim();
    return !!cover && !!path && cover === path;
  }

  async onMediaFilesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (!files.length || !this.book) {
      return;
    }

    this.isUploading = true;
    let uploadedCount = 0;

    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          this.toaster.error(this.l('Books:ImageOnly'));
          continue;
        }

        if (file.size > BookMediaContainers.maxFileSizeMb * 1024 * 1024) {
          this.toaster.error(this.l('Books:FileSizeError'));
          continue;
        }

        const item: BookMediaItemView = {
          key: ++this.mediaKeySeq,
          path: '',
          sort: this.mediaItems.length + 1,
          uploading: true,
          localPreviewUrl: URL.createObjectURL(file),
        };
        this.mediaItems = [...this.mediaItems, item];
        this.cdr.detectChanges();

        try {
          const path = await uploadMediaFile(
            this.mediaService,
            file,
            BookMediaContainers.files,
            0,
            0
          );
          item.path = path;
          item.uploading = false;
          // Keep blob preview until the server path is confirmed usable in the UI.
          if (resolveMediaUrl(path)) {
            this.revokeLocalPreview(item);
          }
          uploadedCount++;
          this.mediaItems = [...this.mediaItems];
          this.cdr.detectChanges();
        } catch {
          this.mediaItems = this.mediaItems.filter(x => x.key !== item.key);
          this.reindexSort();
          this.revokeLocalPreview(item);
          this.toaster.error(this.l('Books:UploadFailed'));
          this.cdr.detectChanges();
        }
      }

      if (uploadedCount > 0) {
        this.reindexSort();
        // Keep local cards visible; API media sync can lag within the same request.
        await this.persistBook({ persistOrder: true, silent: true, keepLocalOrder: true });
        this.toaster.success(this.l('Books:Saved'));
        this.mediaItems = [...this.mediaItems];
        this.cdr.detectChanges();
      }
    } finally {
      this.isUploading = false;
      this.cdr.detectChanges();
    }
  }

  async removeMedia(index: number): Promise<void> {
    if (this.isPersisting || this.isUploading || index < 0 || index >= this.mediaItems.length) {
      return;
    }

    const previous = this.mediaItems.map(item => ({ ...item }));
    const removed = this.mediaItems[index];
    this.mediaItems = this.mediaItems.filter((_, i) => i !== index);
    this.revokeLocalPreview(removed);
    this.reindexSort();
    this.cdr.detectChanges();

    try {
      await this.persistBook({ persistOrder: true, silent: true, keepLocalOrder: true });
      this.toaster.success(this.l('Books:Saved'));
    } catch {
      this.mediaItems = previous;
      this.reindexSort();
      this.cdr.detectChanges();
    }
  }

  moveUp(index: number, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    void this.moveMedia(index, -1);
  }

  moveDown(index: number, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    void this.moveMedia(index, 1);
  }

  private async moveMedia(index: number, direction: -1 | 1): Promise<void> {
    const target = index + direction;
    if (target < 0 || target >= this.mediaItems.length || this.isPersisting || this.isUploading) {
      return;
    }

    const previous = this.mediaItems.map(item => ({ ...item }));
    const items = [...this.mediaItems];
    const [moved] = items.splice(index, 1);
    items.splice(target, 0, moved);
    this.mediaItems = items;
    this.reindexSort();
    this.cdr.detectChanges();

    try {
      // Keep the local order after save so the UI does not snap back
      // if the API response is briefly out of sync.
      await this.persistBook({ persistOrder: true, silent: true, keepLocalOrder: true });
      this.toaster.success(this.l('Books:OrderUpdated'));
    } catch {
      this.mediaItems = previous;
      this.reindexSort();
      this.cdr.detectChanges();
    }
  }

  async setAsCover(item: BookMediaItemView): Promise<void> {
    if (!this.book?.id || !item.path || item.uploading || this.isPersisting) {
      return;
    }

    if (this.isCover(item)) {
      return;
    }

    const oldCover = this.book.coverImage?.trim() || null;
    const newCover = item.path.trim();

    try {
      await this.persistBook({
        persistOrder: true,
        coverImage: newCover,
        silent: true,
      });

      if (oldCover && oldCover !== newCover && oldCover.replace(/\\/g, '/').includes('books/covers/')) {
        try {
          await deleteMediaFile(this.mediaService, oldCover);
        } catch {
          // Cover field already updated; deleting the old file is best-effort.
        }
      }

      this.toaster.success(this.l('Books:CoverUpdated'));
    } catch {
      // persistBook already toasts on failure
    }
  }

  close(): void {
    this.closed.emit();
  }

  private load(): void {
    this.isLoading = true;
    this.booksService
      .get(this.bookId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: book => {
          this.book = book;
          this.syncMediaFromBook(book);
          this.cdr.detectChanges();
        },
        error: () => {
          this.toaster.error(this.l('Books:LoadFailed'));
          this.close();
        },
      });
  }

  private reindexSort(): void {
    this.mediaItems.forEach((item, index) => {
      item.sort = index + 1;
    });
  }

  private syncMediaFromBook(book: BookDto): void {
    const previousByPath = new Map(
      this.mediaItems.filter(item => !!item.path).map(item => [item.path, item.key])
    );

    this.mediaItems.forEach(item => {
      if (!book.media?.some(media => media.filePath === item.path)) {
        this.revokeLocalPreview(item);
      }
    });

    this.mediaItems = (book.media ?? [])
      .filter(item => !!item.filePath)
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || (a.id ?? 0) - (b.id ?? 0))
      .map((item, index) => ({
        key: previousByPath.get(item.filePath!) ?? ++this.mediaKeySeq,
        path: item.filePath!,
        sort: item.sort > 0 ? item.sort : index + 1,
        uploading: false,
        localPreviewUrl: null,
      }));
  }

  private persistBook(options: {
    persistOrder: boolean;
    coverImage?: string | null;
    silent?: boolean;
    keepLocalOrder?: boolean;
  }): Promise<void> {
    if (!this.book?.id) {
      return Promise.resolve();
    }

    const mediaItems = options.persistOrder
      ? this.mediaItems
          .filter(item => !!item.path?.trim())
          .map((item, index) => ({
            filePath: item.path.trim(),
            sort: index + 1,
          }))
      : undefined;

    const coverImage =
      options.coverImage !== undefined ? options.coverImage ?? undefined : this.book.coverImage;

    this.isPersisting = true;
    this.cdr.detectChanges();

    return new Promise((resolve, reject) => {
      this.booksService
        .update(this.book!.id!, {
          nameAr: this.book!.nameAr ?? '',
          nameEn: this.book!.nameEn,
          coverImage,
          isFree: !!this.book!.isFree,
          isRelapse: !!this.book!.isRelapse,
          mediaItems,
        })
        .pipe(
          finalize(() => {
            this.isPersisting = false;
            this.cdr.detectChanges();
          })
        )
        .subscribe({
          next: book => {
            this.book = {
              ...book,
              coverImage: coverImage ?? book.coverImage,
            };
            if (options.persistOrder && !options.keepLocalOrder) {
              this.syncMediaFromBook(book);
            } else if (options.persistOrder) {
              this.reindexSort();
            }
            if (!options.silent) {
              this.toaster.success(this.l('Books:Saved'));
            }
            resolve();
          },
          error: error => {
            this.toaster.error(error?.error?.error?.message || this.l('Books:SaveFailed'));
            reject(error);
          },
        });
    });
  }

  private revokeLocalPreview(item: BookMediaItemView): void {
    if (item.localPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(item.localPreviewUrl);
      item.localPreviewUrl = null;
    }
  }
}
