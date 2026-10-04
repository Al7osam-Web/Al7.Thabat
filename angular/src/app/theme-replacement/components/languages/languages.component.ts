import { ConfigStateService, LanguageInfo, SessionStateService } from '@abp/ng.core';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  standalone:false,
  selector: 'abp-languages',
  template: `
    @if (((dropdownLanguages$ | async)?.length || 0) > 0) {
    <div class="dropdown lang-btn">
      <button
        (click)="toggleDropdown()"
        class="btn btn-primary d-flex justify-content center align-items-center gap-1	"
      >
        <i class="fi fi-rr-earth-americas"></i>
        {{ defaultLanguage$ | async }}
      </button>

      <!-- Dropdown menu (only visible when isOpen is true) -->
      <ul *ngIf="isOpen" class="dropdown-menu dropdown-languages" [ngClass]="{ 'opened': isOpen }">
        @for (lang of dropdownLanguages$ | async; track $index) {
        <li
          href="javascript:void(0)"
          class="dropdown-item"
          (click)="onChangeLang(lang.cultureName || '')"
        >
          {{ lang?.displayName }}
        </li>
        }
      </ul>
    </div>
    }
  `,
})
export class LanguagesComponent {
  get smallScreen(): boolean {
    return window.innerWidth < 992;
  }

  languages$: Observable<LanguageInfo[]> = this.configState.getDeep$('localization.languages');

  get defaultLanguage$(): Observable<string> {
    return this.languages$.pipe(
      map(
        languages =>
          languages?.find(lang => lang.cultureName === this.selectedLangCulture)?.displayName || ''
      )
    );
  }

  get dropdownLanguages$(): Observable<LanguageInfo[]> {
    return this.languages$.pipe(
      map(
        languages => languages?.filter(lang => lang.cultureName !== this.selectedLangCulture) || []
      )
    );
  }

  get selectedLangCulture(): string {
    return this.sessionState.getLanguage();
  }

  constructor(private sessionState: SessionStateService, private configState: ConfigStateService) {}

  onChangeLang(cultureName: string) {
    this.sessionState.setLanguage(cultureName);
  }
  isOpen = false; // To track the dropdown state (open/close)
  dropdownItems = ['Item 1', 'Item 2', 'Item 3']; // List of dropdown items

  // Method to toggle the dropdown open/close state
  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  // Optional: Method to handle item selection
  onItemSelect(item: string) {
    console.log('Selected item:', item);
    this.isOpen = false; // Close dropdown after selection (optional)
  }
}
