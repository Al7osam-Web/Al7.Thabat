import { Component, Injector, OnInit } from '@angular/core';
import { ToasterService } from '@abp/ng.theme.shared';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/shared/app-component-base';
import {
  collectSitePageChange,
  readSitePageValue,
  removeExistingSitePageKey,
  SitePageChange,
  SitePageItem,
  SitePageLanguage,
  SitePagesService,
  SitePageType,
} from '../../services/site-pages.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  standalone: false,
})
export class ContactUsComponent extends AppComponentBase implements OnInit {
  private readonly pageEnum = SitePageType.Contact;
  private readonly section = 'ContactUs';

  isLoading = false;
  isSaving = false;

  items: SitePageItem[] = [];
  email = '';
  twitter = '';
  instagram = '';
  linkedin = '';
  tiktok = '';
  contactNo = '';
  contactNos: string[] = [];
  whatsApp = '';
  readonly linkFields = ['twitter', 'instagram', 'linkedin', 'tiktok'] as const;

  constructor(
    injector: Injector,
    private readonly sitePagesService: SitePagesService,
    private readonly toaster: ToasterService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.sitePagesService
      .getByPage(this.pageEnum)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: result => {
          this.items = result?.items ?? [];
          this.email = readSitePageValue(this.items, 'Email', this.section, SitePageLanguage.None);
          this.twitter = readSitePageValue(this.items, 'Twitter', this.section, SitePageLanguage.None);
          this.instagram = readSitePageValue(this.items, 'Instagram', this.section, SitePageLanguage.None);
          this.linkedin = readSitePageValue(this.items, 'Linkedin', this.section, SitePageLanguage.None);
          this.tiktok = readSitePageValue(this.items, 'Tiktok', this.section, SitePageLanguage.None);
          const phones = readSitePageValue(this.items, 'Phones', this.section, SitePageLanguage.None);
          this.contactNos = phones
            .split(';')
            .map(phone => phone.trim())
            .filter(phone => !!phone);
          this.contactNo = '';
          this.whatsApp = readSitePageValue(this.items, 'WhatsApp', this.section, SitePageLanguage.None);
        },
        error: () => this.toaster.error(this.l('SitePages:LoadFailed')),
      });
  }

  addNo(): void {
    const phone = (this.contactNo ?? '').trim();
    if (!phone) return;
    if (!this.isValidPhone(phone)) {
      return;
    }
    if (this.contactNos.includes(phone)) {
      this.toaster.error(this.l('SitePages:ContactUs.ExistNumber'));
      return;
    }
    this.contactNos.push(phone);
    this.contactNo = '';
  }

  removeNo(index: number): void {
    this.contactNos.splice(index, 1);
  }

  showEmailError(): boolean {
    return !this.isValidEmail(this.email);
  }

  showPhoneError(): boolean {
    return !this.isValidPhone(this.contactNo);
  }

  showWhatsAppError(): boolean {
    return !this.isValidPhone(this.whatsApp);
  }

  showLinkError(field: 'twitter' | 'instagram' | 'linkedin' | 'tiktok'): boolean {
    return !this.isValidLink(this.linkValue(field));
  }

  save(): void {
    if (this.isSaving) return;

    if (!this.isValidEmail(this.email)) {
      this.toaster.error(this.l('SitePages:ContactUs.Validation.InvalidEmail'));
      return;
    }

    if (!this.isValidPhone(this.contactNo) || this.contactNos.some(phone => !this.isValidPhone(phone))) {
      this.toaster.error(this.l('SitePages:ContactUs.Validation.InvalidPhone'));
      return;
    }

    if (!this.isValidPhone(this.whatsApp)) {
      this.toaster.error(this.l('SitePages:ContactUs.Validation.InvalidPhone'));
      return;
    }

    if (this.linkFields.some(field => !this.isValidLink(this.linkValue(field)))) {
      this.toaster.error(this.l('SitePages:ContactUs.Validation.InvalidLink'));
      return;
    }

    const payload: SitePageChange[] = [];
    const fields: Array<[string, string]> = [
      ['Email', this.email],
      ['Twitter', this.twitter],
      ['Instagram', this.instagram],
      ['Linkedin', this.linkedin],
      ['Tiktok', this.tiktok],
      ['Phones', this.contactNos.join(';')],
      ['WhatsApp', this.whatsApp],
    ];

    for (const [key, value] of fields) {
      collectSitePageChange(payload, this.items, this.pageEnum, this.section, key, value, SitePageLanguage.None);
    }

    removeExistingSitePageKey(payload, this.items, this.pageEnum, this.section, 'Address');

    if (!payload.length) {
      this.toaster.success(this.l('SitePages:Saved'));
      return;
    }

    this.isSaving = true;
    this.sitePagesService
      .manage(payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.toaster.success(this.l('SitePages:Saved'));
          this.load();
        },
        error: () => this.toaster.error(this.l('SitePages:SaveFailed')),
      });
  }

  private linkValue(field: 'twitter' | 'instagram' | 'linkedin' | 'tiktok'): string {
    return this[field];
  }

  private isValidLink(value: string): boolean {
    const trimmed = (value ?? '').trim();
    if (!trimmed) {
      return true;
    }

    try {
      const url = new URL(trimmed);
      return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.includes('.');
    } catch {
      return false;
    }
  }

  private isValidEmail(value: string): boolean {
    const trimmed = (value ?? '').trim();
    if (!trimmed) {
      return true;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  }

  private isValidPhone(value: string): boolean {
    const trimmed = (value ?? '').trim();
    if (!trimmed) {
      return true;
    }

    return /^5\d{8}$/.test(trimmed);
  }
}
