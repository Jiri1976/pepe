import { initializeMonthYear } from "../../helpers/common-functions.helper";
import { ProposalCard } from "../../models/proposals/proposalCard.interface";
import { ProposalShift } from "../../models/proposals/proposalShift.interface";

export interface ProposalSlice {
    readonly destination: string;
    readonly schedules: ProposalCard[] | [];
    readonly monthYear: string;
    readonly _original: ProposalCard[] | [];
    readonly selectedInactive: 'Cook' | 'Driver' | 'Pizza' | 'Helper' | null,
    readonly selectedProposal: ProposalShift | null;
}

export const initialProposalSlice: ProposalSlice = {
    destination: '',
    schedules: [],
    monthYear: initializeMonthYear(),
    _original: [],
    selectedInactive: null,
    selectedProposal: null
}