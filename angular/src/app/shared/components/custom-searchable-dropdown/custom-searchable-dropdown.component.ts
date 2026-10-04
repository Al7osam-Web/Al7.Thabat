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

  selector: 'msn-custom-searchable-dropdown',
  templateUrl: './custom-searchable-dropdown.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSearchableDropdownComponent),
      multi: true,
    },
  ],
})
export class CustomSearchableDropdownComponent implements OnInit {
  @Input() placeholder: string = 'shared.select';
  @Input() label: string = '';
  @Input() options: any[] = [];
  @Input() optionLabel: string = 'name';
  @Input() optionValue: string = 'id';
  @Input() selectedName: string = '';
  @Input() value: string | undefined;
  @Input() disabled: boolean = false;
  @Input() displayInRow: boolean = false;
  @Output() dropdownChanged: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}

  ngOnInit(): void {}

  onChange = (value: any): any => value;
  onTouched = (value: any): any => value;

  writeValue(object: any): void {
    if (object != null && this.options) {
      this.value = object;
      this.selectedName = object.name;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onDropdownChange(event: any): void {
    this.selectedName = event.value.name;
    this.dropdownChanged.emit(this.value);
    this.onChange(this.value);
    this.onTouched(this.value);
  }
}
