import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubscriptionPackagesListComponent } from './components/subscription-packages-list/subscription-packages-list.component';

const routes: Routes = [{ path: '', component: SubscriptionPackagesListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubscriptionPackagesRoutingModule {}
