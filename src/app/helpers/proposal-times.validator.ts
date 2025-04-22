import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ValidationErrors } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class DateValidator {
    constructor() { }

    public static ProposalTimesValidator(control: AbstractControl): ValidationErrors | null {
        if (!control.get('timeFrom') || !control.get('timeTo')) {
            return null;
        }

        if (!control.get('timeFrom')?.value || !control.get('timeTo')?.value) {
            return null;
        }

        let from = control.get('timeFrom')?.value;
        let to = control.get('timeTo')?.value;

        let hoursFrom = new Date(from).getHours() < 10 ? '0' + new Date(from).getHours() : new Date(from).getHours();
        let minutesFrom = new Date(from).getMinutes() < 10 ? '0' + new Date(from).getMinutes() : new Date(from).getMinutes();
        let hoursTo = new Date(to).getHours() < 10 ? '0' + new Date(to).getHours() : new Date(to).getHours();
        let minutesTo = new Date(to).getMinutes() < 10 ? '0' + new Date(to).getMinutes() : new Date(to).getMinutes();

        if ((hoursFrom + ':' + minutesFrom) >= (hoursTo + ':' + minutesTo)) {
            return { invalidTime: true };
        }

        return null;
    }
}

// https://blog.frenchstack.com/angular-form-validation-compare-multiple-fields
// https://elanna.me/blog/2021/06/creating-a-multi-control-custom-validator-in-angular
// https://stackoverflow.com/questions/62890714/comparing-values-in-custom-validator-in-angular
// https://v17.angular.io/guide/form-validation