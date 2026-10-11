import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { AboutComponent } from './components/about/about.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { SitePagesLayoutComponent } from './components/site-pages-layout/site-pages-layout.component';
import { TermsComponent } from './components/terms/terms.component';
import { SitePagesRoutingModule } from './site-pages-routing.module';

@NgModule({
  declarations: [
    SitePagesLayoutComponent,
    AboutComponent,
    PrivacyComponent,
    TermsComponent,
    ContactUsComponent,
  ],
  imports: [CommonModule, SharedModule, SitePagesRoutingModule],
})
export class SitePagesModule {}
