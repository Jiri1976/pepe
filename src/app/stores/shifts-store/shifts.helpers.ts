import { customError, maxLength, required, SchemaPathTree, validate } from "@angular/forms/signals";
import { ShiftModel } from "../../models/shifts/shift.interface";

export function buildShift(a: SchemaPathTree<ShiftModel>) {
    required(a.date, { message: 'Datum je povinný' })
    required(a.from, { message: 'Čas OD je povinný' });
    required(a.to, { message: 'Čas DO je povinný' });
    validate(a.from, ({ valueOf }) => {
        return shiftTimesValidator(valueOf(a.from), valueOf(a.to));
    });
    validate(a.to, ({ value, valueOf }) => {
        //return shiftTimesValidator(valueOf(a.from), value())
        return shiftTimesValidator(valueOf(a.from), valueOf(a.to));
    });
    maxLength(a.perso, 100, { message: 'Maximálně 100 znaků' });
}

function shiftTimesValidator(timeFrom: Date | null, timeTo: Date | null) {
    if (!timeFrom || !timeTo) {
        return null;
    }
    if (timeFrom >= timeTo) {
        return customError({
            kind: 'shiftTimesInvalid',
            message: 'Zkontroluj časy',
        });
    }
    return null;
}