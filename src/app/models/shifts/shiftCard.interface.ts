import { Shift } from "./shift.interface";

export interface ShiftCard {
    id: number,
    monthYear: string,
    userId: number,
    user: string,
    userPosition: string,
    totalHours: string,
    shifts: Shift[]
}