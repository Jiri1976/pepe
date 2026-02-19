import { initializeMonthYear } from "../../helpers/common-functions.helper";
import { WarehouseCard } from "../../models/warehouse/warehouse-card.interface";

export interface WarehouseSlice {
    readonly destination: string;
    readonly monthYear: string;
    readonly cards: WarehouseCard[];
    readonly selectedCard: WarehouseCard | null;
    readonly sliceIndex: number;
    readonly selectedCardPosition: string;
}

export const initialWarehouseSlice: WarehouseSlice = {
    destination: '',
    monthYear: initializeMonthYear(),
    cards: [],
    selectedCard: null,
    sliceIndex: 0,
    selectedCardPosition: ''
}