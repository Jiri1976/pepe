import { ProposalShift } from "./proposalShift.interface";

export interface ProposalUser {
    id: number,
    name: string,
    surname: string;
    position: string;
    shifts: ProposalShift[]
}