import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToasterService } from '@abp/ng.theme.shared';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/shared/app-component-base';
import { FaqsService } from 'src/app/proxy/faqs';

@Component({
  selector: 'app-faq-form',
  templateUrl: './faq-form.component.html',
  standalone: false,
})
export class FaqFormComponent extends AppComponentBase implements OnInit {
  @Input() dialogMode = false;
  @Input() faqId = 0;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  isEditMode = false;
  isLoading = false;
  isSaving = false;
  form!: FormGroup;

  constructor(
    injector: Injector,
    private readonly fb: FormBuilder,
    private readonly faqsService: FaqsService,
    private readonly toaster: ToasterService
  ) {
    super(injector);
    this.form = this.fb.group({
      titleAr: ['', [Validators.required, Validators.maxLength(256)]],
      titleEn: ['', [Validators.maxLength(256)]],
      descriptionAr: ['', [Validators.required, Validators.maxLength(2000)]],
      descriptionEn: ['', [Validators.maxLength(2000)]],
      sort: [1, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.isEditMode = this.faqId > 0;
    if (this.isEditMode) {
      this.load();
    }
  }

  showError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  load(): void {
    this.isLoading = true;
    this.faqsService
      .get(this.faqId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: item => {
          this.form.patchValue({
            titleAr: item.titleAr ?? '',
            titleEn: item.titleEn ?? '',
            descriptionAr: item.descriptionAr ?? '',
            descriptionEn: item.descriptionEn ?? '',
            sort: item.sort ?? 1,
          });
        },
        error: () => {
          this.toaster.error(this.l('Faqs:LoadFailed'));
          this.back();
        },
      });
  }

  save(): void {
    if (this.isSaving) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isSaving = true;
    const value = this.form.getRawValue();
    const input = {
      titleAr: (value.titleAr ?? '').trim(),
      titleEn: (value.titleEn ?? '').trim() || undefined,
      descriptionAr: (value.descriptionAr ?? '').trim(),
      descriptionEn: (value.descriptionEn ?? '').trim() || undefined,
      sort: Number(value.sort) || 1,
    };

    const request = this.isEditMode
      ? this.faqsService.update(this.faqId, input)
      : this.faqsService.create(input);

    request.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => {
        this.toaster.success(this.l('Faqs:Saved'));
        this.saved.emit();
      },
      error: error =>
        this.toaster.error(error?.error?.error?.message || this.l('Faqs:SaveFailed')),
    });
  }

  back(): void {
    this.cancelled.emit();
  }
}
