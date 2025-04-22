import { ProposalShift } from "./proposalShift.interface";

export interface ProposalDay {
    id: number,
    proposalCardId: number,
    date: string,
    proposalShifts: ProposalShift[]
}