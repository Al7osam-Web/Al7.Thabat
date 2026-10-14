import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToasterService } from '@abp/ng.theme.shared';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/shared/app-component-base';
import { BooksService } from 'src/app/proxy/books';
import { MediaService } from 'src/app/proxy/media';
import {
  BookMediaContainers,
  resolveMediaUrl,
  uploadMediaFile,
} from '../../services/media-upload.helper';

@Component({
  selector: 'app-book-form',
  templateUrl: './book-form.component.html',
  standalone: false,
})
export class BookFormComponent extends AppComponentBase implements OnInit {
  @Input() dialogMode = false;
  @Input() bookId = 0;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  isEditMode = false;
  isLoading = false;
  isSaving = false;
  form!: FormGroup;
  selectedCoverFile: File | null = null;

  constructor(
    injector: Injector,
    private readonly fb: FormBuilder,
    private readonly booksService: BooksService,
    private readonly mediaService: MediaService,
    private readonly toaster: ToasterService
  ) {
    super(injector);
    this.form = this.fb.group({
      nameAr: ['', [Validators.required, Validators.maxLength(256)]],
      nameEn: ['', [Validators.maxLength(256)]],
      coverImage: ['', [Validators.maxLength(500)]],
      isFree: [false],
      isRelapse: [false],
    });
  }

  ngOnInit(): void {
    this.isEditMode = this.bookId > 0;
    if (this.isEditMode) {
      this.load();
    }
  }

  showError(controlName: 'nameAr' | 'nameEn' | 'coverImage'): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getCoverUrl(): string | null {
    if (this.selectedCoverFile) {
      return null;
    }

    return resolveMediaUrl(this.form.get('coverImage')?.value);
  }

  onCoverSelected(event: { file: File }): void {
    const file = event.file;
    if (file.size > BookMediaContainers.maxCoverSizeMb * 1024 * 1024) {
      this.toaster.error(this.l('Books:CoverSizeError'));
      return;
    }

    this.selectedCoverFile = file;
    this.form.get('coverImage')?.markAsTouched();
  }

  onCoverRemoved(): void {
    this.selectedCoverFile = null;
    this.form.patchValue({ coverImage: '' });
    this.form.get('coverImage')?.markAsTouched();
  }

  load(): void {
    this.isLoading = true;
    this.booksService
      .get(this.bookId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: book => {
          this.form.patchValue({
            nameAr: book.nameAr ?? '',
            nameEn: book.nameEn ?? '',
            coverImage: book.coverImage ?? '',
            isFree: !!book.isFree,
            isRelapse: !!book.isRelapse,
          });
          this.selectedCoverFile = null;
        },
        error: () => {
          this.toaster.error(this.l('Books:LoadFailed'));
          this.back();
        },
      });
  }

  async save(): Promise<void> {
    if (this.isSaving) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isSaving = true;
    try {
      const value = this.form.getRawValue();
      let coverImage = (value.coverImage ?? '').trim() || undefined;
      if (this.selectedCoverFile) {
        coverImage = await uploadMediaFile(
          this.mediaService,
          this.selectedCoverFile,
          BookMediaContainers.covers,
          BookMediaContainers.coverWidth,
          BookMediaContainers.coverHeight
        );
      }

      const input = {
        nameAr: (value.nameAr ?? '').trim(),
        nameEn: (value.nameEn ?? '').trim() || undefined,
        coverImage,
        isFree: !!value.isFree,
        isRelapse: !!value.isRelapse,
        // Keep existing media when editing book details.
        mediaItems: this.isEditMode ? undefined : [],
      };

      const request = this.isEditMode
        ? this.booksService.update(this.bookId, input)
        : this.booksService.create(input);

      request.pipe(finalize(() => (this.isSaving = false))).subscribe({
        next: () => {
          this.toaster.success(this.l('Books:Saved'));
          this.saved.emit();
        },
        error: error =>
          this.toaster.error(error?.error?.error?.message || this.l('Books:SaveFailed')),
      });
    } catch {
      this.isSaving = false;
      this.toaster.error(this.l('Books:UploadFailed'));
    }
  }

  back(): void {
    this.cancelled.emit();
  }
}
