import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './components/about/about.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { SitePagesLayoutComponent } from './components/site-pages-layout/site-pages-layout.component';
import { TermsComponent } from './components/terms/terms.component';

const routes: Routes = [
  {
    path: '',
    component: SitePagesLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'about' },
      { path: 'about', component: AboutComponent },
      { path: 'privacy', component: PrivacyComponent },
      { path: 'terms', component: TermsComponent },
      { path: 'contact-us', component: ContactUsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SitePagesRoutingModule {}
