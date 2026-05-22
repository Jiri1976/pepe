import { maxLength, required, SchemaPathTree, validate } from "@angular/forms/signals";
import { Shift, ShiftModel } from "../../models/shifts.interface";

export function buildShift(a: SchemaPathTree<ShiftModel>) {
    required(a.date, { message: 'Datum je povinný' })
    required(a.from, { message: 'Čas OD je povinný' });
    required(a.to, { message: 'Čas DO je povinný' });
    validate(a.from, ({ valueOf }) => {
        return shiftTimesValidator(valueOf(a.from), valueOf(a.to));
    });
    validate(a.to, ({ value, valueOf }) => {
        return shiftTimesValidator(valueOf(a.from), valueOf(a.to));
    });
    maxLength(a.perso, 100, { message: 'Maximálně 100 znaků' });
}

function shiftTimesValidator(timeFrom: Date | null, timeTo: Date | null) {
    if (!timeFrom || !timeTo) {
        return null;
    }
    if (timeFrom >= timeTo) {
        return {
            kind: 'shiftTimesInvalid',
            message: 'Zkontroluj časy',
        };
    }
    return null;
}

export function sortShifts(shifts: Shift[]): Shift[] {
    const order = (val?: boolean) =>
        val === true ? 0 : val === false ? 1 : 2;

    const toMin = (t?: string) => {
        if (!t) return Number.MAX_SAFE_INTEGER;
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };

    const getDuration = (shift: Shift) => {
        if (!shift.from || !shift.to) return 0;

        let start = toMin(shift.from);
        let end = toMin(shift.to);

        // handle overnight shifts
        if (end < start) {
            end += 24 * 60;
        }

        return end - start;
    };

    return shifts.slice().sort((a, b) => {
        // ✅ group by confirmed
        const groupDiff = order(a.confirmed) - order(b.confirmed);
        if (groupDiff !== 0) return groupDiff;

        // ✅ sort by duration DESC
        const durationA = getDuration(a);
        const durationB = getDuration(b);

        if (durationA !== durationB) return durationB - durationA;

        // ✅ if equal → earlier start first
        return toMin(a.from) - toMin(b.from);
    });
}

