import { ApplicationInfo, EnvironmentService } from '@abp/ng.core';
import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'abp-account-logo',
  template: `
    <img src="assets/images/logo/thabat-logo.png" alt="ثبات" width="200" height="215" />
  `,
  styles: [
    `
      :host {
        display: flex;
        justify-content: center;
        margin-bottom: 16px;
      }

      img {
        width: 200px;
        height: auto;
        object-fit: contain;
      }
    `,
  ],
})
export class AccountLogoComponent {
  get appInfo(): ApplicationInfo {
    return this.environment.getEnvironment().application;
  }

  constructor(private environment: EnvironmentService) {}
}
