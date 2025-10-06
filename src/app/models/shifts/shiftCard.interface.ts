import { Shift } from "./shift.interface";

export interface ShiftCard {
    id: number,
    monthYear: string,
    destination: string,
    userId: number,
    userName: string,
    userSurname: string,
    userPosition: string,
    totalHours: string,
    shifts: Shift[]
}