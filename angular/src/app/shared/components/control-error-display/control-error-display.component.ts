import { LocalizationService } from '@abp/ng.core';
import { Component, OnInit, Input } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';

@Component({
  standalone: false,

  selector: 'app-control-error-display',
  templateUrl: './control-error-display.component.html',
  styleUrls: ['./control-error-display.component.sass'],
})
export class ControlErrorDisplayComponent implements OnInit {
  constructor(private localizationService: LocalizationService) {}

  ngOnInit(): void {}

  getControlErrors(): string[] {
    let result: string[] = [];
    if (this.control.errors) {
     
      for (const key in this.control.errors) {
        if (key.toString() == 'pattern') {
          result.push(`error.validation.${key.toString()}.${this.patternMessage}`);
        } else {
          result.push(`error.validation.${key.toString()}`);
        }
      }
    }
    return result;
  }

  @Input() control: AbstractControl = new FormControl();
  @Input() patternMessage: any;
}
