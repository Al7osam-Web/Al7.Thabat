import { authGuard, permissionGuard } from '@abp/ng.core';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
    canActivate: [authGuard],
  },
  {
    path: 'account',
    loadChildren: () =>
      import('@abp/ng.account').then(m => m.AccountModule.forLazy({ redirectUrl: '/' })),
  },
  {
    path: 'identity',
    loadChildren: () => import('@abp/ng.identity').then(m => m.IdentityModule.forLazy()),
    canActivate: [authGuard],
  },
  {
    path: 'setting-management',
    loadChildren: () =>
      import('@abp/ng.setting-management').then(m => m.SettingManagementModule.forLazy()),
    canActivate: [authGuard],
  },
  {
    path: 'site-pages',
    loadChildren: () => import('./modules/site-pages/site-pages.module').then(m => m.SitePagesModule),
    canActivate: [authGuard, permissionGuard],
    data: { requiredPolicy: 'Thabat.SitePages' },
  },
  {
    path: 'clients',
    loadChildren: () => import('./modules/clients/clients.module').then(m => m.ClientsModule),
    canActivate: [authGuard, permissionGuard],
    data: { requiredPolicy: 'Thabat.Clients' },
  },
  {
    path: 'books',
    loadChildren: () => import('./modules/books/books.module').then(m => m.BooksModule),
    canActivate: [authGuard, permissionGuard],
    data: { requiredPolicy: 'Thabat.Books' },
  },
  {
    path: 'tasks',
    loadChildren: () => import('./modules/tasks/tasks.module').then(m => m.TasksModule),
    canActivate: [authGuard, permissionGuard],
    data: { requiredPolicy: 'Thabat.Tasks' },
  },
  {
    path: 'paths',
    loadChildren: () => import('./modules/paths/paths.module').then(m => m.PathsModule),
    canActivate: [authGuard, permissionGuard],
    data: { requiredPolicy: 'Thabat.Paths' },
  },
  {
    path: 'survey-questions',
    loadChildren: () =>
      import('./modules/survey-questions/survey-questions.module').then(m => m.SurveyQuestionsModule),
    canActivate: [authGuard, permissionGuard],
    data: { requiredPolicy: 'Thabat.SurveyQuestions' },
  },
  {
    path: 'subscription-packages',
    loadChildren: () =>
      import('./modules/subscription-packages/subscription-packages.module').then(
        m => m.SubscriptionPackagesModule
      ),
    canActivate: [authGuard, permissionGuard],
    data: { requiredPolicy: 'Thabat.SubscriptionPackages' },
  },
  {
    path: 'faqs',
    loadChildren: () => import('./modules/faqs/faqs.module').then(m => m.FaqsModule),
    canActivate: [authGuard, permissionGuard],
    data: { requiredPolicy: 'Thabat.Faqs' },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
