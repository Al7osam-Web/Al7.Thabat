import { Component, Input, OnInit, Output, EventEmitter, forwardRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
@Component({
  standalone: false,

  selector: 'app-custom-input-form',
  templateUrl: './custom-input-form.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomInputFormComponent),
      multi: true
    }
  ]
})
export class CustomInputFormComponent implements OnInit {
  @Input() type: string = 'text';
  @Input() label: string = 'Input';
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() pattern: string = '';
  @Input() min: number | null = null;
  @Input() max: number | null = null;
  @Input() disabled: boolean = false;
  @Input() displayInRow: boolean = false;
  @Input() value: any = '';
  onChange: any = () => {};
  onTouched: any = () => {};
  @Output() valueChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() validChange: EventEmitter<any> = new EventEmitter<any>();

  @Input()formGroup: FormGroup = this.fb.group({
    
  });

  get inputId() {
    return this.label.toLowerCase().replace(/\s+/g, '-');
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    
    const validators = [];

    if (this.required) {
      validators.push(Validators.required);
    }
    // const pattern = this.getPatternByType(this.type);
    // if (pattern) {
    //   validators.push(Validators.pattern(pattern));
    // }

    if (this.min !== null) {
      validators.push(Validators.min(this.min));
    }

    if (this.max !== null) {
      validators.push(Validators.max(this.max));
    }
    this.formGroup = this.fb.group({
      inputValue: ['', validators],
      phoneNumber: new FormControl('', [
        Validators.pattern(/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)
      ])
    });
  }

  // private getPatternByType(type: string): string | null {
  //  
  //   switch (type) {
  //     case 'email':
  //       return '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$';
  //     case 'tel':
  //       return '^(5|0)[0-9]{8}$'; // Example for phone numbers
  //     case 'number':
  //       return '^[0-9]+$';
  //     default:
  //       return null;
  //   }
  // }
  
  writeValue(value: any): void {
   

    this.value = value;
  }

  registerOnChange(fn: any): void {
   

    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
   

    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  emitInputTextValue(value: any): void {
    this.value = value;
    this.onChange(value);
    this.valueChange.emit(value);
  }

  getErrorMessage() {
   
    if (this.formGroup.controls['phoneNumber'].hasError('pattern')) {
      return '🚨 Invalid format! Please follow the correct pattern.';
    }
    return '';
  }

}
