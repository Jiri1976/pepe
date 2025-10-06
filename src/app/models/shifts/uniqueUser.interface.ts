import { ShiftCard } from "./shiftCard.interface";

export interface UniqueUser {
    userId: number;
    userName: string;
    userSurname: string;
    cards: ShiftCard[];
}