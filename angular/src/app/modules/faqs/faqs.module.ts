import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { FaqFormComponent } from './components/faq-form/faq-form.component';
import { FaqsListComponent } from './components/faqs-list/faqs-list.component';
import { FaqsRoutingModule } from './faqs-routing.module';

@NgModule({
  declarations: [FaqsListComponent, FaqFormComponent],
  imports: [CommonModule, SharedModule, FaqsRoutingModule],
})
export class FaqsModule {}
