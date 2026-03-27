export interface Shift {
    id: number,
    shiftCardId: number,
    userId: number,
    position: string,
    destination: string,
    date: string,
    from?: string,
    to?: string,
    hours?: string,
    perso?: string,
    createdAt: string | null,
    createdBy: string | null,
    updatedAt: string | null,
    updatedBy: string | null
}

export interface ShiftModel {
    date: string,
    from: Date | null,
    to: Date | null,
    perso: string
}

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

export interface UniqueUser {
    userId: number;
    userName: string;
    userSurname: string;
    cards: ShiftCard[];
}