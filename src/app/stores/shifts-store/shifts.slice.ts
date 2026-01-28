import { initializeMonthYear } from "../../helpers/common-functions.helper";

export interface ShiftsSlice {
    readonly destination: string;
    readonly monthYear: string;
}

export const initialShiftsSlice: ShiftsSlice = {
    destination: '',
    monthYear: initializeMonthYear(),
}