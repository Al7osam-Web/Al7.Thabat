import { CoreModule, provideAbpCore, withOptions } from '@abp/ng.core';
import { provideAbpOAuth } from '@abp/ng.oauth';
import { provideSettingManagementConfig } from '@abp/ng.setting-management/config';
import { provideFeatureManagementConfig } from '@abp/ng.feature-management';
import { ThemeSharedModule, provideAbpThemeShared, withValidationBluePrint } from '@abp/ng.theme.shared';
import { provideIdentityConfig } from '@abp/ng.identity/config';
import { provideAccountConfig } from '@abp/ng.account/config';
import { registerLocale } from '@abp/ng.core/locale';
import { ThemeLeptonXModule } from '@abp/ng.theme.lepton-x';
import { SideMenuLayoutModule } from '@abp/ng.theme.lepton-x/layouts';
import { AccountLayoutModule } from '@abp/ng.theme.lepton-x/account';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { APP_ROUTE_PROVIDER } from './route.provider';
import { SharedModule } from './shared/shared.module';
import { RtlDirective } from './sharedFeatures/directives/rtl.directive';
import { DateInputFormatDirective } from './sharedFeatures/directives/date-input-format.directive';
import { AcceptLanguageInterceptor } from './accept-language.interceptor';
import { AccountLogoComponent } from './theme-replacement/components/account-logo/account-logo.component';
import { AccountLayoutComponent } from './theme-replacement/components/account-layout/account-layout.component';
import { LoginComponent } from './theme-replacement/components/login/login.component';
import { LanguagesComponent } from './theme-replacement/components/languages/languages.component';

@NgModule({
  declarations: [
    AppComponent,
    RtlDirective,
    DateInputFormatDirective,
    LoginComponent,
    AccountLayoutComponent,
    AccountLogoComponent,
    LanguagesComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ThemeSharedModule,
    CoreModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    ThemeLeptonXModule.forRoot(),
    SideMenuLayoutModule.forRoot(),
    AccountLayoutModule.forRoot(),
  ],
  providers: [
    APP_ROUTE_PROVIDER,
    provideAbpCore(
      withOptions({
        environment,
        registerLocaleFn: registerLocale(),
      }),
    ),
    provideAbpOAuth(),
    provideIdentityConfig(),
    provideSettingManagementConfig(),
    provideFeatureManagementConfig(),
    provideAccountConfig(),
    provideAbpThemeShared(
      withValidationBluePrint({
        uniqueUsername: '::AlreadyExists[{{ username }}]',
      }),
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useExisting: AcceptLanguageInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
