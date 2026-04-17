
import { environment } from "../../../../environments/environment";
import { ShiftCard } from "../../../models/shifts.interface";
import { WarehouseCard, WarehouseItem } from "../../../models/warehouses.interface";

export interface SignalRSlice {
    readonly wCards: WarehouseCard[] | null;
    readonly wItems: WarehouseItem[] | null;
    readonly sCards: ShiftCard[];
    readonly token: string | null;
    readonly notifications: string[];
    readonly pepeHUb: string;
}

export const initialSignalRSlice: SignalRSlice = {
    wCards: null,
    wItems: null,
    sCards: [],
    token: null,
    notifications: [],
    pepeHUb: environment.PEPE_HUB
};