import { initializeMonthYear } from "../../helpers/common-functions.helper";
import { Shift, ShiftCard, TodaysShifts } from "../../models/shifts.interface";

export interface ShiftsSlice {
    readonly destination: string;
    readonly monthYear: string;
    readonly cards: ShiftCard[];
    readonly selectedCard: ShiftCard | null;
    readonly sliceIndex: number;
    readonly selectedCardPosition: string;
    readonly selectedShift: Shift;
    readonly isAddShiftDialogRequested: boolean;
    readonly todaysShifts: TodaysShifts;
    readonly concurrentErrors: string[];
    readonly selectedDailyIndex: number;
}

export const initialShiftsSlice: ShiftsSlice = {
    destination: 'F-M',
    monthYear: initializeMonthYear(),
    cards: [],
    selectedCard: null,
    sliceIndex: 0,
    selectedCardPosition: '',
    selectedShift: {
        id: 0,
        shiftCardId: 0,
        userId: 0,
        position: '',
        destination: '',
        date: '',
        from: '',
        to: '',
        hours: '',
        perso: '',
        createdAt: null,
        createdBy: null,
        updatedAt: null,
        updatedBy: null
    },
    isAddShiftDialogRequested: false,
    todaysShifts: {
        users: [],
        shifts: []
    },
    concurrentErrors: [],
    selectedDailyIndex: -1
}