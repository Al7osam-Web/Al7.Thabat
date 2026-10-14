import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SurveyQuestionsListComponent } from './components/survey-questions-list/survey-questions-list.component';

const routes: Routes = [{ path: '', component: SurveyQuestionsListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveyQuestionsRoutingModule {}
