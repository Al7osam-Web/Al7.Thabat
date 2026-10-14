import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PathsListComponent } from './components/paths-list/paths-list.component';

const routes: Routes = [{ path: '', component: PathsListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PathsRoutingModule {}
