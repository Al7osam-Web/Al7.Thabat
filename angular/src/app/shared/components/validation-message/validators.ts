import { AbstractControl, ValidatorFn } from "@angular/forms";

export function matchOtherValidator(otherControlName: string): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.parent) return null;
  
      const otherControl = control.parent.get(otherControlName);
      if (!otherControl) return null;
  
      if (control.value !== otherControl.value) {
        return { match: true };
      }
  
      return null;
    };
  }
  