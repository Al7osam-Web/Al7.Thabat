import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Month } from '../enum/Month';
import { LocalizationService } from '@abp/ng.core';

@Injectable({
  providedIn: 'root',
})
export class PageTitleService {
  constructor(private title: Title, private localizationService: LocalizationService) {}
  getMonths(month: Month) {
    return month;
  }
  setTitleTranslated(titleKey: string): void {
    //TableUpdated
    /*   this.localizationService.get([titleKey]).subscribe(res => {
      this.title.setTitle(res[titleKey]);
    }); */
  }

  setTitle(title: string): void {
    this.title.setTitle(`${title}`);
  }
}
