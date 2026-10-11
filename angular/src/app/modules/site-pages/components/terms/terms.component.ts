import { Component, Injector, OnInit } from '@angular/core';
import { ToasterService } from '@abp/ng.theme.shared';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/shared/app-component-base';
import {
  collectSitePageChange,
  isRichTextEmpty,
  readSitePageValue,
  SitePageChange,
  SitePageItem,
  SitePageLanguage,
  SitePagesService,
  SitePageType,
} from '../../services/site-pages.service';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  standalone: false,
})
export class TermsComponent extends AppComponentBase implements OnInit {
  private readonly pageEnum = SitePageType.Terms;
  private readonly section = 'Terms';

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
      this.toaster.error(this.l('SitePages:Terms.Validation.Required'));
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
