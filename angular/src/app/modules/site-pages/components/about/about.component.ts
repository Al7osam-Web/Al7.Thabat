import { Component, Injector, OnInit } from '@angular/core';
import { ToasterService } from '@abp/ng.theme.shared';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/shared/app-component-base';
import {
  collectSitePageChange,
  isRichTextEmpty,
  readSitePageValue,
  removeExistingSitePageKey,
  SitePageChange,
  SitePageItem,
  SitePageLanguage,
  SitePagesService,
  SitePageType,
} from '../../services/site-pages.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  standalone: false,
})
export class AboutComponent extends AppComponentBase implements OnInit {
  private readonly pageEnum = SitePageType.About;
  private readonly section = 'About';

  isLoading = false;
  isSaving = false;
  items: SitePageItem[] = [];
  descriptionAr = '';
  descriptionEn = '';

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
          this.descriptionAr = readSitePageValue(
            this.items,
            'Description',
            this.section,
            SitePageLanguage.Arabic
          );
          this.descriptionEn = readSitePageValue(
            this.items,
            'Description',
            this.section,
            SitePageLanguage.English
          );
        },
        error: () => this.toaster.error(this.l('SitePages:LoadFailed')),
      });
  }

  save(): void {
    if (this.isSaving) return;
    if (isRichTextEmpty(this.descriptionAr) || isRichTextEmpty(this.descriptionEn)) {
      this.toaster.error(this.l('SitePages:About.Validation.Required'));
      return;
    }

    const payload: SitePageChange[] = [];
    collectSitePageChange(
      payload,
      this.items,
      this.pageEnum,
      this.section,
      'Description',
      this.descriptionAr,
      SitePageLanguage.Arabic
    );
    collectSitePageChange(
      payload,
      this.items,
      this.pageEnum,
      this.section,
      'Description',
      this.descriptionEn,
      SitePageLanguage.English
    );
    removeExistingSitePageKey(payload, this.items, this.pageEnum, this.section, 'Title');
    this.persist(payload);
  }

  private persist(payload: SitePageChange[]): void {
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
}
