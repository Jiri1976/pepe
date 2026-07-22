import { environment } from '../../../../environments/environment';
import { ProposalCard } from '../../../models/proposals.interface';
import { ShiftCard } from '../../../models/shifts.interface';
import { User } from '../../../models/users.interface';
import {
  WarehouseCard,
  WarehouseItem,
} from '../../../models/warehouses.interface';

export interface SignalRSlice {
  readonly wCards: WarehouseCard[] | null;
  readonly wItems: WarehouseItem[] | null;
  readonly sCard: ShiftCard | null;
  readonly sUser: User | null;
  readonly sAction: string | null;
  readonly sProposals: ProposalCard[] | null;
  //readonly updateSignalRProposals: boolean;
  readonly updateShifts: boolean;
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
  // updateSignalRProposals: false,
  updateShifts: false,
  token: null,
  notifications: [],
  pepeHUb: environment.PEPE_HUB,
};
