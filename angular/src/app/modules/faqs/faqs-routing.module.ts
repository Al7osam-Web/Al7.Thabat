import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FaqsListComponent } from './components/faqs-list/faqs-list.component';

const routes: Routes = [{ path: '', component: FaqsListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FaqsRoutingModule {}
