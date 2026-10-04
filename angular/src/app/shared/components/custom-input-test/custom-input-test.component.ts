import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  forwardRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  standalone: false,

  selector: 'msn-custom-input-test',
  templateUrl: './custom-input-test.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomInputTestComponent),
      multi: true,
    },
  ],
})
export class CustomInputTestComponent implements OnInit {
  @Input() placeholder: string = '';
  @Input() id: string = '';
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() pattern: any = "";
  @Input() min: number | null = null;
  @Input() max: number | null = null;
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() displayInRow: boolean = false;
  @Input() value: string | undefined;

  @Output() inputTextChanged: EventEmitter<string> = new EventEmitter<string>();

  textChanged = new Subject<string>();

  constructor() {
    // This is intentional
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
   
   this.pattern = this.getPatternByType(this.type);
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
  private getPatternByType(type: string): string | null {
   
    switch (type) {
      case 'email':
        return '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$';
      case 'tel':
        return '^(5|0)[0-9]{8}$'; // Example for phone numbers
      case 'number':
        return '^[0-9]+$';
      default:
        return null;
    }
  }
}
