import { Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToasterService } from '@abp/ng.theme.shared';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/shared/app-component-base';
import { TaskStage, TasksService } from 'src/app/proxy/tasks';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  standalone: false,
})
export class TaskFormComponent extends AppComponentBase implements OnInit, OnDestroy {
  @Input() dialogMode = false;
  @Input() taskId = 0;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  isEditMode = false;
  isLoading = false;
  isSaving = false;
  form!: FormGroup;
  maxDay = TaskStage.SevenDays;
  private stageSub?: Subscription;

  readonly stageOptions = [
    { labelKey: 'Tasks:Stage.SevenDays', value: TaskStage.SevenDays },
    { labelKey: 'Tasks:Stage.ThirtyDays', value: TaskStage.ThirtyDays },
    { labelKey: 'Tasks:Stage.NinetyDays', value: TaskStage.NinetyDays },
  ];

  constructor(
    injector: Injector,
    private readonly fb: FormBuilder,
    private readonly tasksService: TasksService,
    private readonly toaster: ToasterService
  ) {
    super(injector);
    this.form = this.fb.group({
      stage: [TaskStage.SevenDays, [Validators.required]],
      titleAr: ['', [Validators.required, Validators.maxLength(512)]],
      titleEn: ['', [Validators.maxLength(512)]],
      subTitleAr: ['', [Validators.maxLength(512)]],
      subTitleEn: ['', [Validators.maxLength(512)]],
      day: [1, [Validators.required, Validators.min(1), Validators.max(TaskStage.SevenDays)]],
    });
  }

  ngOnInit(): void {
    this.applyDayValidators(this.form.get('stage')?.value, false);
    this.stageSub = this.form.get('stage')?.valueChanges.subscribe(stage => {
      this.applyDayValidators(stage, true);
    });

    this.isEditMode = this.taskId > 0;
    if (this.isEditMode) {
      this.load();
    }
  }

  ngOnDestroy(): void {
    this.stageSub?.unsubscribe();
  }

  showError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  load(): void {
    this.isLoading = true;
    this.tasksService
      .get(this.taskId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: task => {
          this.form.patchValue(
            {
              stage: task.stage,
              titleAr: task.titleAr ?? '',
              titleEn: task.titleEn ?? '',
              subTitleAr: task.subTitleAr ?? '',
              subTitleEn: task.subTitleEn ?? '',
              day: task.day ?? 1,
            },
            { emitEvent: false }
          );
          this.applyDayValidators(task.stage, false);
        },
        error: () => {
          this.toaster.error(this.l('Tasks:LoadFailed'));
          this.back();
        },
      });
  }

  private applyDayValidators(stage: TaskStage | number | null | undefined, clampValue: boolean): void {
    const max = this.resolveMaxDay(stage);
    this.maxDay = max;

    const dayControl = this.form.get('day');
    if (!dayControl) {
      return;
    }

    dayControl.setValidators([Validators.required, Validators.min(1), Validators.max(max)]);

    if (clampValue) {
      const current = Number(dayControl.value) || 1;
      if (current > max) {
        dayControl.setValue(max);
      }
    }

    dayControl.updateValueAndValidity({ emitEvent: false });
  }

  private resolveMaxDay(stage: TaskStage | number | null | undefined): number {
    const value = Number(stage);
    if (value === TaskStage.ThirtyDays || value === TaskStage.NinetyDays || value === TaskStage.SevenDays) {
      return value;
    }

    return TaskStage.SevenDays;
  }

  save(): void {
    if (this.isSaving) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isSaving = true;
    const value = this.form.getRawValue();
    const input = {
      stage: Number(value.stage) as TaskStage,
      titleAr: (value.titleAr ?? '').trim(),
      titleEn: (value.titleEn ?? '').trim() || undefined,
      subTitleAr: (value.subTitleAr ?? '').trim() || undefined,
      subTitleEn: (value.subTitleEn ?? '').trim() || undefined,
      day: Number(value.day) || 1,
    };

    const request = this.isEditMode
      ? this.tasksService.update(this.taskId, input)
      : this.tasksService.create(input);

    request.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => {
        this.toaster.success(this.l('Tasks:Saved'));
        this.saved.emit();
      },
      error: error =>
        this.toaster.error(error?.error?.error?.message || this.l('Tasks:SaveFailed')),
    });
  }

  back(): void {
    this.cancelled.emit();
  }
}
