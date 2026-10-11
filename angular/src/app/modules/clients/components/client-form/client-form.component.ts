import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToasterService } from '@abp/ng.theme.shared';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/shared/app-component-base';
import { ClientsApiService } from '../../services/clients-api.service';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  standalone: false,
})
export class ClientFormComponent extends AppComponentBase implements OnInit {
  @Input() dialogMode = false;
  @Input() clientId = 0;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  isEditMode = false;
  isLoading = false;
  isSaving = false;
  form!: FormGroup;

  constructor(
    injector: Injector,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly clientsApi: ClientsApiService,
    private readonly toaster: ToasterService
  ) {
    super(injector);
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(128)]],
      emailAddress: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^5\d{8}$/)]],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    if (this.dialogMode) {
      this.isEditMode = this.clientId > 0;
      if (this.isEditMode) {
        this.load();
      }
      return;
    }

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = Number.isFinite(id) && id > 0;
    this.clientId = this.isEditMode ? id : 0;
    if (this.isEditMode) {
      this.load();
    }
  }

  showError(controlName: 'name' | 'emailAddress' | 'phoneNumber'): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  load(): void {
    this.isLoading = true;
    this.clientsApi
      .get(this.clientId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: client => {
          this.form.patchValue({
            name: client.name ?? '',
            emailAddress: client.emailAddress ?? '',
            phoneNumber: client.phoneNumber ?? '',
            isActive: client.isActive,
          });
        },
        error: () => {
          this.toaster.error(this.l('Clients:LoadFailed'));
          this.back();
        },
      });
  }

  save(): void {
    if (this.isSaving) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    const input = {
      name: (value.name ?? '').trim(),
      emailAddress: (value.emailAddress ?? '').trim(),
      phoneNumber: (value.phoneNumber ?? '').trim(),
      isActive: !!value.isActive,
    };

    this.isSaving = true;
    const request = this.isEditMode
      ? this.clientsApi.update(this.clientId, input)
      : this.clientsApi.create(input);

    request.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => {
        this.toaster.success(this.l('Clients:Saved'));
        if (this.dialogMode) {
          this.saved.emit();
          return;
        }
        this.back();
      },
      error: error => this.toaster.error(error?.error?.error?.message || this.l('Clients:SaveFailed')),
    });
  }

  back(): void {
    if (this.dialogMode) {
      this.cancelled.emit();
      return;
    }

    this.router.navigate(['/clients']);
  }
}
