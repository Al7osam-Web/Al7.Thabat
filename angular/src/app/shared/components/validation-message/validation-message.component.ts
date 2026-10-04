import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { AppComponentBase } from '../../app-component-base';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-validation-message',
  templateUrl: './validation-message.component.html',
  styleUrls: ['./validation-message.component.scss'],
})
export class ValidationMessageComponent extends AppComponentBase implements OnInit, OnDestroy {
  @Input() control: AbstractControl | null = null;
  @Input() errorMap: { [key: string]: string } = {};
  @Input() formReset: boolean = false;
  private valueChangesSub: Subscription | null = null;
  forceShow = false;
  constructor(injector: Injector) {
    super(injector);
  }
  ngOnInit(): void {
    if (this.control) {
      // Start with forceShow as false so that errors don't show on form load or reset
      this.forceShow = false;

      // Listen for control changes to show error only after interaction
      this.valueChangesSub = this.control.valueChanges.subscribe(() => {
        // Show error only after the field is touched
        if (this.control?.touched) {
          this.forceShow = true;
        }
      });

      // Ensure errors don't show immediately on form load/reset
      if (this.control.invalid && this.control.touched) {
        this.forceShow = true; // Show error if the field is touched
      }
    }
  }

  ngOnDestroy(): void {
    this.valueChangesSub?.unsubscribe();
  }
  get errorMessages(): string[] {
    if (
      !this.control ||
      !this.control.errors ||
      (!this.control.touched && !this.forceShow) ||
      this.formReset
    ) {
      return [];
    }
    const messages: string[] = [];

    for (const errorKey in this.control.errors) {
      if (this.errorMap[errorKey]) {
        messages.push(this.l(this.errorMap[errorKey]));
      } else {
        messages.push('قيمة غير صالحة'); // fallback message
      }
    }

    return messages;
  }
}
