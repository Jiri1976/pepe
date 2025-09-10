import { WarehouseUnit } from "./warehouse-unit.interface";

export interface WarehouseCard {
    id: number,
    warehouseItemId: number,
    warehouseItemName: string,
    monthYear: string,
    monthYearName: string,
    destination: string,
    position: number,
    units: WarehouseUnit[]
}