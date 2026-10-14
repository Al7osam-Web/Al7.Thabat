import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { TasksListComponent } from './components/tasks-list/tasks-list.component';
import { TasksRoutingModule } from './tasks-routing.module';

@NgModule({
  declarations: [TasksListComponent, TaskFormComponent],
  imports: [CommonModule, SharedModule, TasksRoutingModule],
})
export class TasksModule {}
