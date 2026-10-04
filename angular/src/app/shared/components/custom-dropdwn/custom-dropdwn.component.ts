import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  forwardRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  standalone: false,

  selector: 'msn-custom-dropdown',
  templateUrl: './custom-dropdwn.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDropdwnComponent),
      multi: true,
    },
  ],
})
export class CustomDropdwnComponent implements OnInit {
  @Input() placeholder: string = 'shared.select';
  @Input() label: string = '';
  @Input() options: any[] = [];
  @Input() optionLabel: string = 'name';
  @Input() optionValue: string = 'id';
  @Input() value: string | undefined;
  @Input() disabled: boolean = false;
  @Input() displayInRow: boolean = false;
  @Output() dropdownChanged: EventEmitter<any> = new EventEmitter<any>();
  @Input() showDefualt : boolean = false;
  constructor() {}

  ngOnInit(): void {}

  onChange = (value: any): any => value;
  onTouched = (value: any): any => value;

  writeValue(object: any): void {
    this.value = object;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onDropdownChange(): void {
    this.dropdownChanged.emit(this.value);
    this.onChange(this.value);
    this.onTouched(this.value);
  }
}
