import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ValidationErrors } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class CheckBoxesValidator {
    constructor() { }

    public static CheckBoxesAreCheckedValidator(control: AbstractControl): ValidationErrors | null {
        if (!control.get('role') || !control.get('position') || !control.get('destination')) {
            return null;
        }

        let name = control.get('name');
        let surname = control.get('surname');
        let email = control.get('email');
        let password = control.get('password');
        let role = control.get('role');
        let position = control.get('position');
        let destination = control.get('destination');

        if (name?.invalid || surname?.invalid || email?.invalid || password?.invalid) {
            return null;
        }

        if (role?.hasError('required') || position?.hasError('required') || destination?.hasError('required')) {
            return { checkBoxesInvalid: true };
        }
        return null;
    }
}