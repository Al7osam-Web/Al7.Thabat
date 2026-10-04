import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a class="navbar-brand thabat-logo" routerLink="/">
      <img
        class="thabat-logo__full"
        src="assets/images/logo/thabat-logo.png"
        alt="ثبات"
        width="124"
        height="134"
      />
      <img
        class="thabat-logo__icon"
        src="assets/images/logo/thabat-logo-icon.png"
        alt=""
        width="44"
        height="44"
      />
    </a>
  `,
  styles: [
    `
      .thabat-logo__full {
        width: 124px;
        height: auto;
        display: block;
      }

      .thabat-logo__icon {
        display: none;
        width: 44px;
        height: 44px;
        object-fit: contain;
      }
    `,
  ],
})
export class LogoComponent {}
