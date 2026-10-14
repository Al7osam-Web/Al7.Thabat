import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { SurveyQuestionFormComponent } from './components/survey-question-form/survey-question-form.component';
import { SurveyQuestionsListComponent } from './components/survey-questions-list/survey-questions-list.component';
import { SurveyQuestionsRoutingModule } from './survey-questions-routing.module';

@NgModule({
  declarations: [SurveyQuestionsListComponent, SurveyQuestionFormComponent],
  imports: [CommonModule, SharedModule, SurveyQuestionsRoutingModule],
})
export class SurveyQuestionsModule {}
