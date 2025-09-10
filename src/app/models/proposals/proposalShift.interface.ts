export interface ProposalShift {
    id: number,
    monthYear: string,
    proposalDate: string,
    userId: number,
    userName: string,
    userSurname: string,
    position: string,
    destination: string,
    listOrder: number,
    from: string | null,
    to: string | null
}