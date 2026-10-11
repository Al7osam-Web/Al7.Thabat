import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
//import { AuthWrapperService, TenantBoxService } from '@volo/abp.ng.account.core';
import { AuthWrapperService, TenantBoxService } from '@abp/ng.account.core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigStateService, LanguageInfo, SessionStateService } from '@abp/ng.core';

@Component({
  standalone: false,
  selector: 'app-account-layout',
  templateUrl: './account-layout.component.html',
  styleUrls: ['./account-layout.component.scss'],
  providers: [AuthWrapperService, TenantBoxService],
})
export class AccountLayoutComponent implements OnInit, OnDestroy {
  languages$: Observable<LanguageInfo[]> = this.configState.getDeep$('localization.languages');
  constructor(
    public router: Router,
    public configState: ConfigStateService,
    public sessionState: SessionStateService,
    public authWrapperService: AuthWrapperService,
    public tenantBoxService: TenantBoxService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.forceLightTheme();
  }

  ngOnDestroy() {
    this.restoreSavedTheme();
  }

  private forceLightTheme(): void {
    document.documentElement.classList.add('account-theme-light');
    document.documentElement.style.colorScheme = 'only light';
    document.body.classList.add('account-theme-light');
    document.body.classList.remove('dark-mode');
    document.body.style.colorScheme = 'only light';
  }

  private restoreSavedTheme(): void {
    document.documentElement.classList.remove('account-theme-light');
    document.documentElement.style.removeProperty('color-scheme');
    document.body.classList.remove('account-theme-light');
    document.body.style.removeProperty('color-scheme');

    const savedTheme = localStorage.getItem('theme');
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedTheme === 'dark' || savedDarkMode === 'true') {
      document.body.classList.add('dark-mode');
    }
  }

  get defaultLanguage$(): Observable<LanguageInfo> {
    return this.languages$.pipe(
      map(
        languages =>
          languages?.find(lang => lang.cultureName === this.selectedLangCulture) ||
          ({} as LanguageInfo)
      )
    );
  }

  get dropdownLanguages$(): Observable<LanguageInfo[]> {
    return this.languages$.pipe(
      map(languages => {
        return languages?.filter(lang => lang.cultureName !== this.selectedLangCulture) || [];
      })
    );
  }

  get selectedLangCulture(): string {
    return this.sessionState.getLanguage();
  }
  onChangeLang(cultureName: string) {
    this.sessionState.setLanguage(cultureName);
    this.cdr.detectChanges();
  }
}
