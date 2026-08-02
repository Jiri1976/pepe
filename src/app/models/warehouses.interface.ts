export interface WarehouseCard {
  id: number;
  warehouseItemId: number;
  warehouseItemName: string;
  monthYear: string;
  monthYearName: string;
  destination: string;
  position: number;
  units: WarehouseUnit[];
}

export interface OverViewDay {
  amount: string;
}

export interface OverviewLine {
  days: OverViewDay[];
}

export interface OverviewCard {
  lines: OverviewLine[];
}

export interface WarehouseUnit {
  id: number;
  warehouseCardId: number;
  warehouseItemId: number;
  date: string;
  amount?: number;
}

export interface WarehouseItem {
  id: number;
  name: string;
  position: number;
}

export type SignalWarehouseItemResponse = [
  user: string,
  items: WarehouseItem[],
  message: string,
];

export type SignalWarehouseCardResponse = [
  user: string,
  cards: WarehouseCard[],
  message: string,
];
