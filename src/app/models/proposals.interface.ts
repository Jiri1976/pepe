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
  monthYear: string;
  monthYearName: string;
  destination: string;
  countOfDays: number;
  users: ProposalUser[];
  inactiveUsers: ProposalUser[];
}

export interface ProposalShift {
  id: number;
  monthYear: string;
  proposalDate: string;
  userId: number;
  userName: string;
  userSurname: string;
  position: string;
  destination: string;
  listOrder: number;
  from: string | null;
  to: string | null;
}

export interface ProposalUser {
  id: number;
  name: string;
  surname: string;
  position: string;
  shifts: ProposalShift[];
}

export type SignalProposalCardResponse = [
  user: string,
  cards: ProposalCard[],
  message: string,
];

export interface ScheduleGeneratorRequest {
  monthYear: string;
  destination: string;
  constraints: ScheduleConstraint[] | null;
}

export interface ScheduleConstraint {
  userId: number;
  position: string;
  targetShifts: number | null;
  allowedWeekdays: number[] | null;
  unavailableDates: string[] | null;
  onlyMorningShifts: boolean | null;
  onlyAfternoonShifts: boolean | null;
  morningDates: string[] | null;
  afternoonDates: string[] | null;
  wholeDayDates: string[] | null;
  oppositeShifts: ProposalShift[] | null;
}

export const initialScheduleGeneratorRequest: ScheduleGeneratorRequest = {
  monthYear: '',
  destination: '',
  constraints: [],
};

export interface SavedScheduleGeneratorRequestDTO {
  monthYear: string;
  destination: string;
  users: ProposalUser[];
}
