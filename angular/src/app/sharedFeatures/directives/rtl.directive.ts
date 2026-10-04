import { Directive, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { LocalizationService } from '@abp/ng.core';

@Directive({
  selector: '[NcrsRtl]',
    standalone: false,

})
export class RtlDirective implements OnInit {
  constructor(
    private elem: ElementRef,
    private renderer: Renderer2,
    private localizationService: LocalizationService
  ) {}

  ngOnInit(): void {
    //TableUpdated
    this.localizationService.languageChange$.subscribe((lang: any) => {
      this.setRtlDirection(lang);
    });
  }
  setRtlDirection(lang: string): void {
    lang === 'ar'
      ? this.renderer.addClass(this.elem.nativeElement, 'rtl')
      : this.renderer.removeClass(this.elem.nativeElement, 'rtl');
  }
}
