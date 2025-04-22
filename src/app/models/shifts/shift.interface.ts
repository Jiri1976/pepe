export interface Shift {
    id: number,
    shiftCardId: number,
    userId: number,
    date: string,
    from?: string,
    to?: string,
    hours?: string,
    perso?: string
}