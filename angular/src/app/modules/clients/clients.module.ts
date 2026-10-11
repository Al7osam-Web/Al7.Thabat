import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { ClientFormComponent } from './components/client-form/client-form.component';
import { ClientsListComponent } from './components/clients-list/clients-list.component';
import { ClientsRoutingModule } from './clients-routing.module';

@NgModule({
  declarations: [ClientsListComponent, ClientFormComponent],
  imports: [CommonModule, SharedModule, ClientsRoutingModule],
})
export class ClientsModule {}
