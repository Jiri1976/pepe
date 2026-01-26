import { ProposalUser } from "./proposalUser.interface";

export interface ProposalCard {
    monthYear: string,
    monthYearName: string;
    destination: string,
    countOfDays: number;
    users: ProposalUser[];
    inactiveUsers: ProposalUser[];
}