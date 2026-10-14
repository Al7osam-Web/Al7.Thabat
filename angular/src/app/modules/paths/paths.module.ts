import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { PathFormComponent } from './components/path-form/path-form.component';
import { PathsListComponent } from './components/paths-list/paths-list.component';
import { PathsRoutingModule } from './paths-routing.module';

@NgModule({
  declarations: [PathsListComponent, PathFormComponent],
  imports: [CommonModule, SharedModule, PathsRoutingModule],
})
export class PathsModule {}
