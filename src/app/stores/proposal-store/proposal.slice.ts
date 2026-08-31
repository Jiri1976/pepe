import { initializeMonthYear } from '../../helpers/common-functions.helper';
import {
  initialScheduleGeneratorRequest,
  ProposalCard,
  ProposalShift,
  ScheduleGeneratorRequest,
} from '../../models/proposals.interface';

export interface ProposalSlice {
  readonly destination: string;
  readonly schedules: ProposalCard[] | [];
  readonly monthYear: string;
  readonly _original: ProposalCard[] | [];
  readonly selectedInactive: 'Cook' | 'Driver' | 'Pizza' | 'Helper' | null;
  readonly selectedProposal: ProposalShift | null;
  readonly scheduleGeneratorRequest: ScheduleGeneratorRequest | null;
}

export const initialProposalSlice: ProposalSlice = {
  destination: '',
  schedules: [],
  monthYear: initializeMonthYear(),
  _original: [],
  selectedInactive: null,
  selectedProposal: null,
  scheduleGeneratorRequest: initialScheduleGeneratorRequest,
};
