export interface Proposal {
    timeFrom: Date | null;
    timeTo: Date | null;
}

export interface Inputs {
    hoursFrom: string | number;
    minutesFrom: string | number;
    hoursTo: string | number;
    minutesTo: string | number;
}

export interface ProposalCard {
    monthYear: string,
    monthYearName: string;
    destination: string,
    countOfDays: number;
    users: ProposalUser[];
    inactiveUsers: ProposalUser[];
}

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

export interface ProposalUser {
    id: number,
    name: string,
    surname: string;
    position: string;
    shifts: ProposalShift[]
}