import { ChangeDetectorRef, Component } from '@angular/core';
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
export class AccountLayoutComponent {
  languages$: Observable<LanguageInfo[]> = this.configState.getDeep$('localization.languages');
  constructor(
    public router: Router,
    public configState: ConfigStateService,
    public sessionState: SessionStateService,
    public authWrapperService: AuthWrapperService,
    public tenantBoxService: TenantBoxService,
    private cdr: ChangeDetectorRef
  ) {}

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
