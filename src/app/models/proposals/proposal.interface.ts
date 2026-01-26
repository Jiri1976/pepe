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