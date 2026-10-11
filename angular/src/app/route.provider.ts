import { RoutesService, eLayoutType } from '@abp/ng.core';
import { inject, provideAppInitializer } from '@angular/core';

export const APP_ROUTE_PROVIDER = [
  provideAppInitializer(() => {
    configureRoutes();
  }),
];

function configureRoutes() {
  const routes = inject(RoutesService);
  routes.add([
      {
        path: '/',
        name: '::Menu:Home',
        iconClass: 'fas fa-home',
        order: 1,
        layout: eLayoutType.application,
      },
      {
        path: '/site-pages',
        name: '::NavItems:SitePages',
        iconClass: 'fi fi-rr-file',
        order: 9,
        layout: eLayoutType.application,
        requiredPolicy: 'Thabat.SitePages',
      },
      {
        path: '/site-pages/about',
        name: '::SitePages:About.Title',
        parentName: '::NavItems:SitePages',
        iconClass: 'fi fi-rr-info',
        order: 1,
        layout: eLayoutType.application,
        requiredPolicy: 'Thabat.SitePages',
      },
      {
        path: '/site-pages/privacy',
        name: '::SitePages:Privacy.Title',
        parentName: '::NavItems:SitePages',
        iconClass: 'fi fi-rr-shield-check',
        order: 2,
        layout: eLayoutType.application,
        requiredPolicy: 'Thabat.SitePages',
      },
      {
        path: '/site-pages/terms',
        name: '::SitePages:Terms.Title',
        parentName: '::NavItems:SitePages',
        iconClass: 'fi fi-rr-document',
        order: 3,
        layout: eLayoutType.application,
        requiredPolicy: 'Thabat.SitePages',
      },
      {
        path: '/site-pages/contact-us',
        name: '::SitePages:ContactUs.Title',
        parentName: '::NavItems:SitePages',
        iconClass: 'fi fi-rr-envelope',
        order: 4,
        layout: eLayoutType.application,
        requiredPolicy: 'Thabat.SitePages',
      },
      {
        path: '/clients',
        name: '::Clients:Title',
        iconClass: 'fi fi-rr-users',
        order: 2,
        layout: eLayoutType.application,
        requiredPolicy: 'Thabat.Clients',
      },
  ]);
}
