import { eAccountComponents, getRedirectUrl } from '@abp/ng.account';
import { AuthService } from '@abp/ng.core';
import { ToasterService } from '@abp/ng.theme.shared';
import { Component, Injector, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/shared/app-component-base';

const { maxLength, required } = Validators;

@Component({
  standalone: false,
  selector: 'abp-login',
  templateUrl: './login.component.html',
})
export class LoginComponent extends AppComponentBase implements OnInit {
  protected injector: Injector;
  protected fb = inject(UntypedFormBuilder);
  protected toasterService = inject(ToasterService);
  protected authService = inject(AuthService);

  form!: UntypedFormGroup;

  inProgress?: boolean;
  pageLoading = false;
  passwordVisible = false;

  isSelfRegistrationEnabled = false;

  authWrapperKey = eAccountComponents.AuthWrapper;

  constructor() {
    const injector = inject(Injector);
    super(injector);
    this.injector = injector;
  }

  ngOnInit() {
    this.init();
    this.buildForm();
  }

  protected init() {
    this.isSelfRegistrationEnabled = false;
  }

  protected buildForm() {
    this.form = this.fb.group({
      username: ['', [required, maxLength(255)]],
      password: ['', [required, maxLength(128)]],
      rememberMe: [false],
    });
  }

  togglePasswordVisible(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit() {
    this.login();
  }

  login() {
    if (this.form.invalid) return;

    this.inProgress = true;
    this.pageLoading = true;

    const { username, password, rememberMe } = this.form.value;
    const redirectUrl = getRedirectUrl(this.injector);

    this.authService
      .login({ username, password, rememberMe, redirectUrl })
      .pipe(
        catchError(err => {
          this.pageLoading = false;
          this.toasterService.error(
            err.error?.error_description ||
              err.error?.error.message ||
              'AbpAccount::DefaultErrorMessage',
            '',
            { life: 7000 }
          );
          return throwError(() => err);
        }),
        finalize(() => (this.inProgress = false))
      )
      .subscribe();
  }
}
