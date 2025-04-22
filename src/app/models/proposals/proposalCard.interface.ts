import { ProposalDay } from "./proposalDay.interface";

export interface ProposalCard {
    id: number,
    monthYear: string,
    monthYearName: string;
    destination: string,
    proposalDays: ProposalDay[]
}