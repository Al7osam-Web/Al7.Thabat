import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

interface SitePageTab {
  path: string;
  labelKey: string;
  descriptionKey: string;
  icon: string;
}

@Component({
  selector: 'app-site-pages-layout',
  templateUrl: './site-pages-layout.component.html',
  standalone: false,
})
export class SitePagesLayoutComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  readonly tabs: SitePageTab[] = [
    {
      path: 'about',
      labelKey: '::SitePages:About.Title',
      descriptionKey: '::SitePages:About.Description',
      icon: 'fa-info-circle',
    },
    {
      path: 'privacy',
      labelKey: '::SitePages:Privacy.Title',
      descriptionKey: '::SitePages:Privacy.Description',
      icon: 'fa-shield',
    },
    {
      path: 'terms',
      labelKey: '::SitePages:Terms.Title',
      descriptionKey: '::SitePages:Terms.Description',
      icon: 'fa-file-text-o',
    },
    {
      path: 'contact-us',
      labelKey: '::SitePages:ContactUs.Title',
      descriptionKey: '::SitePages:ContactUs.Description',
      icon: 'fa-envelope-o',
    },
  ];

  activeTab = this.tabs[0];

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.updateActiveTab(this.router.url);
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(event => this.updateActiveTab(event.urlAfterRedirects));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateActiveTab(url: string): void {
    const path = url.split('?')[0].replace(/\/$/, '');
    this.activeTab = this.tabs.find(tab => path.endsWith(`/site-pages/${tab.path}`)) ?? this.tabs[0];
  }
}
