import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ValidationErrors } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class CheckBoxesValidator {
    public static AtLeastOnePositionCheckedValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const destinations = control.get('destinations') as any;

        if (!destinations || !(destinations instanceof Array || 'length' in destinations) || destinations.length === 0) {
            return { noDestinations: true };
        }

        let atLeastOneChecked = false;
        for (let i = 0; i < destinations.length; i++) {
            const destinationGroup = destinations.at(i);
            if (!destinationGroup) continue;

            const positions = destinationGroup.get('positions');
            if (!positions || !('length' in positions)) continue;

            for (let j = 0; j < positions.length; j++) {
                const positionGroup = positions.at(j);
                if (!positionGroup) continue;

                const positionValue = positionGroup.get('position')?.value;

                if (positionValue) {
                    atLeastOneChecked = true;
                    break;
                }
            }
            if (atLeastOneChecked) break;
        }

        return atLeastOneChecked ? null : { noPositionsSelected: true };
    };
}