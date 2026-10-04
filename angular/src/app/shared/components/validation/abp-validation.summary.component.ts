import {
  Component,
  Input,
  Renderer2,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { NgModel } from '@angular/forms';
import { AbpValidationError } from '../validation/abp-validation.api';
import { LocalizationService } from '@abp/ng.core';
import { map, Observable } from 'rxjs';

@Component({
  standalone: false,
  selector: 'abp-validation-summary',
  templateUrl: './abp-validation.summary.component.html',
})
export class AbpValidationSummaryComponent implements OnInit {
  @Input() control: NgModel; // Use NgModel for template-driven forms
  @Input() controlEl: any;
  @Input() confirmControl: NgModel; // For confirm password validation

  defaultValidationErrors: Partial<AbpValidationError>[] = [
    { name: 'required', localizationKey: '::ThisFieldIsRequired' },
    {
      name: 'minlength',
      localizationKey: 'PleaseEnterAtLeastNCharacter',
      propertyKey: 'requiredLength',
    },
    {
      name: 'maxlength',
      localizationKey: 'PleaseEnterNoMoreThanNCharacter',
      propertyKey: 'requiredLength',
    },
    {
      name: 'email',
      localizationKey: '::InvalidEmailAddress',
    },
    {
      name: 'pattern',
      localizationKey: '::InvalidPattern',
      propertyKey: 'requiredPattern',
    },
    {
      name: 'validateEqual',
      localizationKey: 'PairsDoNotMatch',
    },
  ];

  validationErrors = <AbpValidationError[]>this.defaultValidationErrors;

  constructor(public _renderer: Renderer2, private localizationService: LocalizationService) {}

  ngOnInit() {
    // Handle initial validation checks
    if (this.control && this.controlEl) {
      var nativeElement = this.controlEl.nativeElement
        ? this.controlEl.nativeElement
        : this.controlEl.inputfieldViewChild?.nativeElement;
      if (nativeElement) {
        this.control.valueChanges.subscribe(() => {
          if (this.control.valid && (this.control.dirty || this.control.touched)) {
            this._renderer.removeClass(nativeElement, 'is-invalid');
          }
        });
      }
    }
    // Check for password confirmation validation when confirmControl exists
    if (this.confirmControl) {
      this.confirmControl.valueChanges.subscribe(() => {
        this.checkPasswordsMatch();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Whenever confirmControl or control changes, we need to check if the passwords match.
    if (this.confirmControl) {
      this.confirmControl.valueChanges.subscribe(() => {
        this.checkPasswordsMatch();
      });
    }
  }

  // Handle password match check for both fields
  checkPasswordsMatch() {
    if (this.confirmControl && this.control) {
      // Step 1: Check if fields are required and not empty
      if (!this.control.value) {
        // If password is empty, show 'required' error
        this.control.control.setErrors({ required: true });
      } else if (!this.confirmControl.value) {
        // If confirm password is empty, show 'required' error
        this.confirmControl.control.setErrors({ required: true });
      } else {
        // Step 2: Check if passwords match if both are filled
        if (this.control.value !== this.confirmControl.value) {
          this.control.control.setErrors({ validateEqual: true });
          this.confirmControl.control.setErrors({ validateEqual: true });
        } else {
          this.control.control.setErrors(null); // Clear the errors if passwords match
          this.confirmControl.control.setErrors(null); // Clear the errors if passwords match
        }
      }
    }
  }

  getValidationErrorMessage(error: any): Observable<string> {
    if (this.controlEl) {
      var nativeElement = this.controlEl.nativeElement
        ? this.controlEl.nativeElement
        : this.controlEl.inputfieldViewChild?.nativeElement;
      if (nativeElement) {
        this._renderer.addClass(nativeElement, 'is-invalid');
      }
    }
    const localizedMessage$ = this.localizationService.get(error.localizationKey);
    const propertyValue = this.control.errors?.[error.name]?.[error.propertyKey];
    if (propertyValue) {
      return localizedMessage$.pipe(map(message => message.replace('{0}', propertyValue)));
    }
    return localizedMessage$;
  }
}