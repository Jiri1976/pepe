import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ValidationErrors } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class DateValidator {

    constructor() { }

    public static ProposalTimesValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {

            const timeFromControl = control.get('timeFrom');
            const timeToControl = control.get('timeTo');

            if (!timeFromControl || !timeToControl) {
                return null;
            }

            const from = timeFromControl.value;
            const to = timeToControl.value;

            if (!from || !to) {
                return null;
            }

            const fromDate = new Date(from);
            const toDate = new Date(to);

            const hoursFrom = fromDate.getHours().toString().padStart(2, '0');
            const minutesFrom = fromDate.getMinutes().toString().padStart(2, '0');
            const hoursTo = toDate.getHours().toString().padStart(2, '0');
            const minutesTo = toDate.getMinutes().toString().padStart(2, '0');

            if ((hoursFrom + ':' + minutesFrom) >= (hoursTo + ':' + minutesTo)) {
                return { invalidTime: true };
            }

            return null;
        };
    }
}