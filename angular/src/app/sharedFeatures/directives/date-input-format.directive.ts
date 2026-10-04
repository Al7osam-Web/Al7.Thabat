import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appDateInputFormat]',
    standalone: false,

})
export class DateInputFormatDirective {
  constructor(private el: ElementRef) {}
  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    const formattedValue = this.formatDate(value);
    this.el.nativeElement.value = formattedValue;
  }

  private formatDate(value: string): string {
    // Implement your custom formatting logic here
    // For example: Convert 'yyyymmdd' to 'dd-mm-yyyy'
    const year = value.substr(0, 4);
    const month = value.substr(4, 2);
    const day = value.substr(6, 2);
    return `${day}-${month}-${year}`;
  }
}
