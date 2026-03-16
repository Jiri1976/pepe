import { initializeMonthYear } from "../../helpers/common-functions.helper";
import { WarehouseCard } from "../../models/warehouse/warehouse-card.interface";
import { WarehouseItem } from "../../models/warehouse/warehouse-item.interface";
import { WarehouseUnit } from "../../models/warehouse/warehouse-unit.interface";

export interface WarehouseSlice {
    readonly destination: string;
    readonly monthYear: string;
    readonly cards: WarehouseCard[];
    readonly sliceIndex: number;
    readonly selectedCardPosition: string;
    readonly warehouseNav: 'units' | 'board' | 'items';
    readonly selectedUnit: WarehouseUnit | null;
    readonly warehouseItems: WarehouseItem[] | [];
}

export const initialWarehouseSlice: WarehouseSlice = {
    destination: 'F-M',
    monthYear: initializeMonthYear(),
    cards: [],
    sliceIndex: 0,
    selectedCardPosition: '',
    warehouseNav: 'board',
    selectedUnit: null,
    warehouseItems: []
}