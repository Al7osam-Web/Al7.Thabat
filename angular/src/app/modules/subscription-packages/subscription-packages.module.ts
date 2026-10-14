import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { SubscriptionPackageFormComponent } from './components/subscription-package-form/subscription-package-form.component';
import { SubscriptionPackagesListComponent } from './components/subscription-packages-list/subscription-packages-list.component';
import { SubscriptionPackagesRoutingModule } from './subscription-packages-routing.module';

@NgModule({
  declarations: [SubscriptionPackagesListComponent, SubscriptionPackageFormComponent],
  imports: [CommonModule, SharedModule, SubscriptionPackagesRoutingModule],
})
export class SubscriptionPackagesModule {}
