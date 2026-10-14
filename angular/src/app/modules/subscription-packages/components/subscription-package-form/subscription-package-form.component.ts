import { Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToasterService } from '@abp/ng.theme.shared';
import { merge, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/shared/app-component-base';
import { SubscriptionPackagesService, SubscriptionPeriod } from 'src/app/proxy/subscriptions';

@Component({
  selector: 'app-subscription-package-form',
  templateUrl: './subscription-package-form.component.html',
  standalone: false,
})
export class SubscriptionPackageFormComponent extends AppComponentBase implements OnInit, OnDestroy {
  @Input() dialogMode = false;
  @Input() packageId = 0;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  isEditMode = false;
  isLoading = false;
  isSaving = false;
  form!: FormGroup;
  private billedSyncSub?: Subscription;

  readonly periodOptions = [
    { labelKey: 'SubscriptionPackages:Period.Yearly', value: SubscriptionPeriod.Yearly },
    { labelKey: 'SubscriptionPackages:Period.ThreeMonths', value: SubscriptionPeriod.ThreeMonths },
    { labelKey: 'SubscriptionPackages:Period.Monthly', value: SubscriptionPeriod.Monthly },
  ];

  constructor(
    injector: Injector,
    private readonly fb: FormBuilder,
    private readonly packagesService: SubscriptionPackagesService,
    private readonly toaster: ToasterService
  ) {
    super(injector);
    this.form = this.fb.group({
      nameAr: ['', [Validators.required, Validators.maxLength(256)]],
      nameEn: ['', [Validators.maxLength(256)]],
      descriptionAr: ['', [Validators.maxLength(512)]],
      descriptionEn: ['', [Validators.maxLength(512)]],
      period: [SubscriptionPeriod.Yearly, [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      billedPrice: [0, [Validators.required, Validators.min(0)]],
      originalPrice: [0, [Validators.required, Validators.min(0)]],
      sort: [1, [Validators.required, Validators.min(1)]],
      isFeatured: [false],
    });
  }

  ngOnInit(): void {
    this.billedSyncSub = merge(
      this.form.get('price')!.valueChanges,
      this.form.get('period')!.valueChanges
    ).subscribe(() => this.syncBilledPrice());

    this.isEditMode = this.packageId > 0;
    if (this.isEditMode) {
      this.load();
    }
  }

  ngOnDestroy(): void {
    this.billedSyncSub?.unsubscribe();
  }

  showError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  load(): void {
    this.isLoading = true;
    this.packagesService
      .get(this.packageId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: item => {
          this.form.patchValue(
            {
              nameAr: item.nameAr ?? '',
              nameEn: item.nameEn ?? '',
              descriptionAr: item.descriptionAr ?? '',
              descriptionEn: item.descriptionEn ?? '',
              period: item.period,
              price: item.price ?? 0,
              billedPrice: item.billedPrice ?? 0,
              originalPrice: item.originalPrice ?? 0,
              sort: item.sort ?? 1,
              isFeatured: !!item.isFeatured,
            },
            { emitEvent: false }
          );
        },
        error: () => {
          this.toaster.error(this.l('SubscriptionPackages:LoadFailed'));
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
      nameAr: (value.nameAr ?? '').trim(),
      nameEn: (value.nameEn ?? '').trim() || undefined,
      descriptionAr: (value.descriptionAr ?? '').trim() || undefined,
      descriptionEn: (value.descriptionEn ?? '').trim() || undefined,
      period: Number(value.period) as SubscriptionPeriod,
      price: Number(value.price) || 0,
      billedPrice: Number(value.billedPrice) || 0,
      originalPrice: Number(value.originalPrice) || 0,
      sort: Number(value.sort) || 1,
      isFeatured: !!value.isFeatured,
    };

    const request = this.isEditMode
      ? this.packagesService.update(this.packageId, input)
      : this.packagesService.create(input);

    request.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => {
        this.toaster.success(this.l('SubscriptionPackages:Saved'));
        this.saved.emit();
      },
      error: error =>
        this.toaster.error(error?.error?.error?.message || this.l('SubscriptionPackages:SaveFailed')),
    });
  }

  back(): void {
    this.cancelled.emit();
  }

  private syncBilledPrice(): void {
    const price = Number(this.form.get('price')?.value) || 0;
    const months = Number(this.form.get('period')?.value) || 1;
    const billed = Math.round(price * months * 100) / 100;
    this.form.get('billedPrice')?.setValue(billed, { emitEvent: false });
  }
}
