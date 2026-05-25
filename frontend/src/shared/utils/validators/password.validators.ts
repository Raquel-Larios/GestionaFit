import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordMinLength(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return control.value?.length < min ? { minlength: true } : null;
  };
}

export function hasLowercase(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return !/[a-z]/.test(control.value) ? { lowercase: true } : null;
  };
}

export function hasUppercase(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return !/[A-Z]/.test(control.value) ? { uppercase: true } : null;
  };
}

export function hasNumber(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return !/\d/.test(control.value) ? { number: true } : null;
  };
}

export function hasNoSpaces(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return /\s/.test(control.value) ? { spaces: true } : null;
  };
}