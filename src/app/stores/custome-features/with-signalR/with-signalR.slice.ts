
import { environment } from "../../../../environments/environment";
import { ProposalCard } from "../../../models/proposals.interface";
import { ShiftCard } from "../../../models/shifts.interface";
import { User } from "../../../models/users.interface";
import { WarehouseCard, WarehouseItem } from "../../../models/warehouses.interface";

export interface SignalRSlice {
    readonly wCards: WarehouseCard[] | null;
    readonly wItems: WarehouseItem[] | null;
    readonly sCard: ShiftCard | null;
    readonly sUsers: User[] | null;
    readonly sProposals: ProposalCard[] | null;
    readonly updateSignalRProposals: boolean;
    readonly updateShifts: boolean;
    readonly token: string | null;
    readonly notifications: string[];
    readonly pepeHUb: string;
    // readonly updateSignalRDailyProposals: boolean;
}

export const initialSignalRSlice: SignalRSlice = {
    wCards: null,
    wItems: null,
    sCard: null,
    sUsers: null,
    sProposals: null,
    updateSignalRProposals: false,
    // updateSignalRDailyProposals: false,
    updateShifts: false,
    token: null,
    notifications: [],
    pepeHUb: environment.PEPE_HUB
};