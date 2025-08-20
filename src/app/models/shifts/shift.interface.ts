export interface Shift {
    id: number,
    shiftCardId: number,
    userId: number,
    position: string,
    date: string,
    from?: string,
    to?: string,
    hours?: string,
    perso?: string,
    createdAt?: string,
    createdBy?: string,
    updatedAt?: string,
    updatedBy?: string
}