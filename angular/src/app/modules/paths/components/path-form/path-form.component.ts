import { Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToasterService } from '@abp/ng.theme.shared';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/shared/app-component-base';
import { PathEntryDto, PathsService } from 'src/app/proxy/paths';
import { TaskStage } from 'src/app/proxy/tasks';

@Component({
  selector: 'app-path-form',
  templateUrl: './path-form.component.html',
  standalone: false,
})
export class PathFormComponent extends AppComponentBase implements OnInit, OnDestroy {
  @Input() dialogMode = false;
  @Input() pathId = 0;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  isEditMode = false;
  isLoading = false;
  isSaving = false;
  form!: FormGroup;
  maxDay = TaskStage.SevenDays;
  private stageSub?: Subscription;

  readonly stageOptions = [
    { labelKey: 'Paths:Stage.SevenDays', value: TaskStage.SevenDays },
    { labelKey: 'Paths:Stage.ThirtyDays', value: TaskStage.ThirtyDays },
    { labelKey: 'Paths:Stage.NinetyDays', value: TaskStage.NinetyDays },
  ];

  readonly sections = [
    { key: 'feelings', titleKey: 'Paths:Feelings' },
    { key: 'challenges', titleKey: 'Paths:Challenges' },
    { key: 'tips', titleKey: 'Paths:Tips' },
  ];

  constructor(
    injector: Injector,
    private readonly fb: FormBuilder,
    private readonly pathsService: PathsService,
    private readonly toaster: ToasterService
  ) {
    super(injector);
    this.form = this.fb.group({
      stage: [TaskStage.SevenDays, [Validators.required]],
      day: [1, [Validators.required, Validators.min(1), Validators.max(TaskStage.SevenDays)]],
      feelings: this.fb.array([]),
      challenges: this.fb.array([]),
      tips: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.applyDayValidators(this.form.get('stage')?.value, false);
    this.stageSub = this.form.get('stage')?.valueChanges.subscribe(stage => {
      this.applyDayValidators(stage, true);
    });

    this.isEditMode = this.pathId > 0;
    if (this.isEditMode) {
      this.load();
    } else {
      this.sections.forEach(section => this.addItem(section.key));
    }
  }

  ngOnDestroy(): void {
    this.stageSub?.unsubscribe();
  }

  sectionArray(key: string): FormArray {
    return this.form.get(key) as FormArray;
  }

  showError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  showItemError(sectionKey: string, index: number, controlName: string): boolean {
    const control = this.sectionArray(sectionKey).at(index)?.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  addItem(sectionKey: string): void {
    const items = this.sectionArray(sectionKey);
    items.push(this.createItem(items.length + 1));
  }

  removeItem(sectionKey: string, index: number): void {
    const items = this.sectionArray(sectionKey);
    if (items.length <= 1) {
      return;
    }

    items.removeAt(index);
    this.reindex(sectionKey);
  }

  moveItem(sectionKey: string, index: number, direction: -1 | 1): void {
    const items = this.sectionArray(sectionKey);
    const target = index + direction;
    if (target < 0 || target >= items.length) {
      return;
    }

    const current = items.at(index);
    items.removeAt(index);
    items.insert(target, current);
    this.reindex(sectionKey);
  }

  load(): void {
    this.isLoading = true;
    this.pathsService
      .get(this.pathId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: path => {
          this.form.patchValue({ stage: path.stage, day: path.day ?? 1 }, { emitEvent: false });
          this.applyDayValidators(path.stage, false);
          this.fillSection('feelings', path.feelings);
          this.fillSection('challenges', path.challenges);
          this.fillSection('tips', path.tips);
        },
        error: () => {
          this.toaster.error(this.l('Paths:LoadFailed'));
          this.back();
        },
      });
  }

  private createItem(sort: number, item?: PathEntryDto): FormGroup {
    return this.fb.group({
      descriptionAr: [item?.descriptionAr ?? '', [Validators.required, Validators.maxLength(4000)]],
      descriptionEn: [item?.descriptionEn ?? '', [Validators.maxLength(4000)]],
      sort: [item?.sort ?? sort, [Validators.required, Validators.min(1)]],
    });
  }

  private fillSection(sectionKey: string, items?: PathEntryDto[]): void {
    const array = this.sectionArray(sectionKey);
    array.clear();
    const source = items?.length ? items : [undefined];
    source.forEach((item, index) => array.push(this.createItem(index + 1, item)));
  }

  private reindex(sectionKey: string): void {
    this.sectionArray(sectionKey).controls.forEach((control, index) => {
      control.get('sort')?.setValue(index + 1);
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

  private mapSection(sectionKey: string) {
    return this.sectionArray(sectionKey).getRawValue().map((item: any, index: number) => ({
      descriptionAr: (item.descriptionAr ?? '').trim(),
      descriptionEn: (item.descriptionEn ?? '').trim() || undefined,
      sort: index + 1,
    }));
  }

  save(): void {
    if (this.isSaving) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isSaving = true;
    const value = this.form.getRawValue();
    const input = {
      stage: Number(value.stage) as TaskStage,
      day: Number(value.day) || 1,
      feelings: this.mapSection('feelings'),
      challenges: this.mapSection('challenges'),
      tips: this.mapSection('tips'),
    };

    const request = this.isEditMode
      ? this.pathsService.update(this.pathId, input)
      : this.pathsService.create(input);

    request.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => {
        this.toaster.success(this.l('Paths:Saved'));
        this.saved.emit();
      },
      error: error =>
        this.toaster.error(error?.error?.error?.message || this.l('Paths:SaveFailed')),
    });
  }

  back(): void {
    this.cancelled.emit();
  }
}
