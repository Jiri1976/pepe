export interface InitShift {
    id: number,
    date: Date,
    from: Date,
    to: Date,
    perso?: string,
    position: string,
    destination: string,
    createdAt: string | null,
    createdBy: string | null,
    updatedAt: string | null,
    updatedBy: string | null
}