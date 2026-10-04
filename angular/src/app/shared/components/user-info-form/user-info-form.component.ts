import { LanguageInfo } from '@abp/ng.core';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  forwardRef,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, NG_VALUE_ACCESSOR, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import intlTelInput from 'intl-tel-input';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js'; 

@Component({
  standalone: false ,
  selector: 'user-info-form',
  templateUrl: './user-info-form.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UserInfoFormComponent),
      multi: true,
    },
  ],
})
export class UserInfoFormComponent implements OnInit, AfterViewInit, OnDestroy {
  
  [x: string]: any; 
  private _form: FormGroup | null = null;
  @Input()
  set form(value: FormGroup) {
    this._form = value;
    this.bindPhoneControl(value);
  }
  get form(): FormGroup {
    return this._form as FormGroup;
  }
  @Input() UserName: string = 'text';
  @Input() Email: string = 'Email';
  @Input() PhoneNumber: string = 'number';
  @Input() Password: string = 'Password'; 
  @Input() HaidePassword: boolean = true; 
  @Input() disabledForm: boolean = true; 

  @ViewChild('phoneInput', { static: false }) phoneInput!: ElementRef<HTMLInputElement>;

  selectedLangControl = new FormControl();
  phoneNumberExample: string = '';

  @Output() inputTextChanged: EventEmitter<string> = new EventEmitter<string>();

  textChanged = new Subject<string>();
  languages: LanguageInfo[] = [];
  usertypeSelectedLang: any;

  private intlTelInputInstance: any;
  private destroy$ = new Subject<void>();
  private pendingPhoneValue: string | null = null;
  private phoneControlSub: Subscription | null = null;

  constructor() {
    this.textChanged
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(value => {
        value = value.trim();
        this.inputTextChanged.emit(value);
        this.onChange(value);
        this.onTouched(value);
      });
  }

  ngOnInit(): void {
    this.selectedLangControl = new FormControl();
  }

  ngAfterViewInit(): void {
    if (this.phoneInput && this.phoneInput.nativeElement) {
      this.intlTelInputInstance = intlTelInput(this.phoneInput.nativeElement, {
        countryOrder: ['sa', 'eg', 'ae'],
        initialCountry: 'sa',
        separateDialCode: true,
        placeholderNumberType: 'MOBILE',
        utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@24/build/js/utils.js'
      });

      this.updatePhonePlaceholder();

      const initialValue = this.pendingPhoneValue ?? this.form?.get('phoneNumber')?.value;
      if (typeof initialValue === 'string') {
        this.syncPhoneNumberFromControl(initialValue);
        this.pendingPhoneValue = null;
      }

      this.phoneInput.nativeElement.addEventListener('input', () => {
        this.onPhoneNumberChange();
      });

      this.phoneInput.nativeElement.addEventListener('blur', () => {
        const phoneControl = this.form?.get('phoneNumber');
        phoneControl?.markAsTouched();
      });

      this.phoneInput.nativeElement.addEventListener('countrychange', () => {
        this.updatePhonePlaceholder();
        const phoneControl = this.form?.get('phoneNumber');
        if (phoneControl && phoneControl.value) {
          this.validatePhoneNumber(phoneControl);
        }
        this.onPhoneNumberChange();
      });
    }
  }

  ngOnDestroy(): void {
    if (this.intlTelInputInstance) {
      this.intlTelInputInstance.destroy();
    }
    this.phoneControlSub?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  updatePhonePlaceholder(): void {
    // intl-tel-input handles placeholder automatically
  }

  private bindPhoneControl(form: FormGroup | null | undefined): void {
    this.phoneControlSub?.unsubscribe();
    this.phoneControlSub = null;

    const phoneControl = form?.get('phoneNumber');
    if (!phoneControl) {
      return;
    }

    this.phoneControlSub = phoneControl.valueChanges
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(value => {
        const stringValue = typeof value === 'string' ? value : value?.toString() ?? '';
        if (!this.intlTelInputInstance) {
          this.pendingPhoneValue = stringValue;
          return;
        }
        this.syncPhoneNumberFromControl(stringValue);
      });

    const currentValue = phoneControl.value;
    if (typeof currentValue === 'string') {
      if (!this.intlTelInputInstance) {
        this.pendingPhoneValue = currentValue;
      } else {
        this.syncPhoneNumberFromControl(currentValue);
      }
    }
  }

  private syncPhoneNumberFromControl(value: string | null | undefined): void {
    const normalizedValue = value?.trim() ?? '';
    if (!normalizedValue) {
      this.clearPhoneInput();
      return;
    }

    if (!this.intlTelInputInstance || !this.phoneInput?.nativeElement) {
      this.pendingPhoneValue = normalizedValue;
      return;
    }

    const intlValue = this.toInternationalNumber(normalizedValue);
    if (!intlValue) {
      this.phoneInput.nativeElement.value = normalizedValue;
      return;
    }

    const currentNumber = this.intlTelInputInstance.getNumber();
    if (this.normalizePhoneNumber(currentNumber) === this.normalizePhoneNumber(intlValue)) {
      return;
    }

    try {
      const setResult = this.intlTelInputInstance.setNumber(intlValue);
      if (setResult === false || !this.phoneInput.nativeElement.value) {
        this.phoneInput.nativeElement.value = normalizedValue;
      }
    } catch (e) {
      this.phoneInput.nativeElement.value = normalizedValue;
    }
  }

  private toInternationalNumber(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (trimmed.includes('-')) {
      const parts = trimmed.split('-');
      const dialCode = parts[0];
      const localNumber = parts.slice(1).join('');
      if (dialCode && localNumber) {
        return `+${dialCode}${localNumber}`;
      }
    }

    if (trimmed.startsWith('+')) {
      return trimmed;
    }

    const digitsOnly = trimmed.replace(/[^\d]/g, '');
    if (!digitsOnly) {
      return null;
    }
    if (digitsOnly === trimmed) {
      return `+${digitsOnly}`;
    }

    return trimmed;
  }

  private normalizePhoneNumber(value: string | null | undefined): string {
    return (value ?? '').replace(/[^\d]/g, '');
  }

  private clearPhoneInput(): void {
    if (this.phoneInput?.nativeElement) {
      this.phoneInput.nativeElement.value = '';
    }
    this.phoneNumberExample = '';
  }

  private buildDatabaseFormat(fullNumber: string, dialCode: string | null): string {
    if (!fullNumber || !dialCode) return '';
    const cleaned = fullNumber.replace(/[\s\-\(\)\+]/g, '');
    if (cleaned.length <= dialCode.length) return '';

    let localNumber = cleaned.startsWith(dialCode)
      ? cleaned.substring(dialCode.length)
      : cleaned;

    if (localNumber.length > 0) {
      const trimmed = localNumber.replace(/^0+/, '');
      localNumber = trimmed.length > 0 ? trimmed : localNumber;
    }

    if (!localNumber) return '';
    return `${dialCode}-${localNumber}`;
  }

  onPhoneNumberChange(): void {
    if (this.intlTelInputInstance && this.form && this.form.get('phoneNumber')) {
      const number = this.intlTelInputInstance.getNumber();
      const phoneControl = this.form.get('phoneNumber');
      
      if (number && number.length > 5) {
        const countryData = this.intlTelInputInstance.getSelectedCountryData();
        const dialCode = countryData?.dialCode?.toString() || '';
        
        const cleanedNumber = number.replace(/[\s\-\(\)\+]/g, '');
        if (dialCode && cleanedNumber.length > dialCode.length + 3) {
          const dbFormat = this.buildDatabaseFormat(number, dialCode);
          if (dbFormat) {
            const currentValue = phoneControl?.value;
            if (currentValue !== dbFormat) {
              phoneControl?.setValue(dbFormat, { emitEvent: true });
              phoneControl?.markAsDirty();
              phoneControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
            }
          }
        }
        
        this.validatePhoneNumber(phoneControl);
      } else {
        if (phoneControl && !phoneControl.value) {
          phoneControl.setErrors(null);
        }
      }
    }
  }

  validatePhoneNumber(control: AbstractControl | null): void {
    if (!control || !this.intlTelInputInstance) return;

    const number = this.intlTelInputInstance.getNumber();
    if (!number) {
      this.phoneNumberExample = '';
      return;
    }

    try {
      const countryData = this.intlTelInputInstance.getSelectedCountryData();
      const countryCode = countryData?.iso2?.toUpperCase();
      
      if (countryCode) {
        const phoneNumber = parsePhoneNumber(number, countryCode as any);
        if (phoneNumber && phoneNumber.isValid()) {
          control.setErrors(null);
          this.phoneNumberExample = '';
        } else {
          control.setErrors({ invalidPhoneNumber: true });
          this.setPhoneNumberExample(countryData);
        }
      } else if (isValidPhoneNumber(number)) {
        control.setErrors(null);
        this.phoneNumberExample = '';
      } else {
        control.setErrors({ invalidPhoneNumber: true });
        this.phoneNumberExample = '';
      }
    } catch (error) {
      control.setErrors({ invalidPhoneNumber: true });
      const countryData = this.intlTelInputInstance.getSelectedCountryData();
      this.setPhoneNumberExample(countryData);
    }
  }

  setPhoneNumberExample(countryData: any): void {
    if (countryData && this.phoneInput?.nativeElement) {
      const placeholder = this.phoneInput.nativeElement.placeholder;
      if (placeholder) {
        this.phoneNumberExample = placeholder;
      } else {
        const dialCode = countryData.dialCode || '';
        this.phoneNumberExample = `+${dialCode} XXXX XXXX`;
      }
    }
  }

  convertToDatabaseFormat(phoneValue: string): string {
    if (!phoneValue || phoneValue.trim() === '') return '';
    
    let dialCode: string | null = null;
    if (this.intlTelInputInstance) {
      try {
        const countryData = this.intlTelInputInstance.getSelectedCountryData();
        dialCode = countryData?.dialCode?.toString() || null;
      } catch (error) {
        console.error('Error getting country data:', error);
      }
    }
    if (!dialCode) return phoneValue;

    return this.buildDatabaseFormat(phoneValue, dialCode) || phoneValue;
  }

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

  emitInputTextValue(value: any): void {
    value = value.trim();
    this.inputTextChanged.emit(value);
    this.onChange(value.target);
    this.onTouched(value.target);
  }
}
