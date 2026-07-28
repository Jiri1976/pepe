import { environment } from '../../../../environments/environment';
import { ProposalCard } from '../../../models/proposals.interface';
import { ShiftCard } from '../../../models/shifts.interface';
import { User } from '../../../models/users.interface';
import {
  WarehouseCard,
  WarehouseItem,
} from '../../../models/warehouses.interface';
import { TodaysShifts } from '../../../models/shifts.interface';

export interface SignalRSlice {
  readonly wCards: WarehouseCard[] | null;
  readonly wItems: WarehouseItem[] | null;
  readonly sCard: ShiftCard | null;
  readonly sUser: User | null;
  readonly sAction: string | null;
  readonly sProposals: ProposalCard[] | null;
  readonly sProposalMessage: string | null;
  readonly sShiftMessage: string | null;
  readonly sTodaysMessage: string | null;
  readonly sTodaysShifts: TodaysShifts | null;
  readonly sTodaysDestination: string | null;
  readonly token: string | null;
  readonly notifications: string[];
  readonly pepeHUb: string;
}

export const initialSignalRSlice: SignalRSlice = {
  wCards: null,
  wItems: null,
  sCard: null,
  sUser: null,
  sAction: null,
  sProposals: null,
  sProposalMessage: null,
  sShiftMessage: null,
  sTodaysMessage: null,
  sTodaysShifts: null,
  sTodaysDestination: null,
  token: null,
  notifications: [],
  pepeHUb: environment.PEPE_HUB,
};
