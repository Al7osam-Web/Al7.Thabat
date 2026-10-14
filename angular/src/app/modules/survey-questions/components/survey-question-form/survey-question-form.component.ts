import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToasterService } from '@abp/ng.theme.shared';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/shared/app-component-base';
import { SurveyQuestionsService } from 'src/app/proxy/surveys';

@Component({
  selector: 'app-survey-question-form',
  templateUrl: './survey-question-form.component.html',
  standalone: false,
})
export class SurveyQuestionFormComponent extends AppComponentBase implements OnInit {
  @Input() dialogMode = false;
  @Input() questionId = 0;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  isEditMode = false;
  isLoading = false;
  isSaving = false;
  form!: FormGroup;

  constructor(
    injector: Injector,
    private readonly fb: FormBuilder,
    private readonly surveyQuestionsService: SurveyQuestionsService,
    private readonly toaster: ToasterService
  ) {
    super(injector);
    this.form = this.fb.group({
      titleAr: ['', [Validators.required, Validators.maxLength(512)]],
      titleEn: ['', [Validators.maxLength(512)]],
      sort: [1, [Validators.required, Validators.min(1)]],
      answers: this.fb.array([]),
    });
  }

  get answers(): FormArray {
    return this.form.get('answers') as FormArray;
  }

  ngOnInit(): void {
    this.isEditMode = this.questionId > 0;
    if (this.isEditMode) {
      this.load();
    } else {
      this.addAnswer();
      this.addAnswer();
    }
  }

  showError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  showAnswerError(index: number, controlName: string): boolean {
    const control = this.answers.at(index)?.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  addAnswer(): void {
    this.answers.push(
      this.fb.group({
        titleAr: ['', [Validators.required, Validators.maxLength(512)]],
        titleEn: ['', [Validators.maxLength(512)]],
        degree: [0, [Validators.required]],
        sort: [this.answers.length + 1, [Validators.required, Validators.min(1)]],
      })
    );
  }

  removeAnswer(index: number): void {
    if (this.answers.length <= 1) {
      this.toaster.error(this.l('SurveyQuestions:Validation.AnswersRequired'));
      return;
    }

    this.answers.removeAt(index);
    this.reindexAnswers();
  }

  moveAnswer(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= this.answers.length) {
      return;
    }

    const current = this.answers.at(index);
    this.answers.removeAt(index);
    this.answers.insert(target, current);
    this.reindexAnswers();
  }

  load(): void {
    this.isLoading = true;
    this.surveyQuestionsService
      .get(this.questionId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: question => {
          this.form.patchValue({
            titleAr: question.titleAr ?? '',
            titleEn: question.titleEn ?? '',
            sort: question.sort ?? 1,
          });
          this.answers.clear();
          const items = question.answers?.length ? question.answers : [{ titleAr: '', degree: 0, sort: 1 }];
          items.forEach(answer => {
            this.answers.push(
              this.fb.group({
                titleAr: [answer.titleAr ?? '', [Validators.required, Validators.maxLength(512)]],
                titleEn: [answer.titleEn ?? '', [Validators.maxLength(512)]],
                degree: [answer.degree ?? 0, [Validators.required]],
                sort: [answer.sort ?? 1, [Validators.required, Validators.min(1)]],
              })
            );
          });
        },
        error: () => {
          this.toaster.error(this.l('SurveyQuestions:LoadFailed'));
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
      sort: Number(value.sort) || 1,
      answers: (value.answers ?? []).map((answer: any, index: number) => ({
        titleAr: (answer.titleAr ?? '').trim(),
        titleEn: (answer.titleEn ?? '').trim() || undefined,
        degree: Number(answer.degree ?? 0),
        sort: index + 1,
      })),
    };

    const request = this.isEditMode
      ? this.surveyQuestionsService.update(this.questionId, input)
      : this.surveyQuestionsService.create(input);

    request.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => {
        this.toaster.success(this.l('SurveyQuestions:Saved'));
        this.saved.emit();
      },
      error: error =>
        this.toaster.error(error?.error?.error?.message || this.l('SurveyQuestions:SaveFailed')),
    });
  }

  back(): void {
    this.cancelled.emit();
  }

  private reindexAnswers(): void {
    this.answers.controls.forEach((control, index) => {
      control.get('sort')?.setValue(index + 1, { emitEvent: false });
    });
  }
}
