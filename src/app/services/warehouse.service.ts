import { inject, Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Response } from '../models/response.interface';
import { WarehouseItem } from "../models/warehouse/warehouse-item.interface";
import { WarehouseUnit } from "../models/warehouse/warehouse-unit.interface";
import { WarehouseCard } from "../models/warehouse/warehouse-card.interface";

@Injectable({
    providedIn: 'root'
})
export class WarehouseService {
    private http = inject(HttpClient);
    private BASE_ROUTE = environment.WAREHOUSE_PATH;
    items = signal<WarehouseItem[]>([]);
    warehouseCard = signal<WarehouseCard>({ id: 0, warehouseItemId: 0, warehouseItemName: '', monthYear: '', monthYearName: '', destination: '', units: [] });
    selectedUnit = signal<WarehouseUnit>({ id: 0, warehouseCardId: 0, warehouseItemId: 0, date: '', amount: 0 });

    setItems(_items: WarehouseItem[]) {
        this.items.set(_items);
    }

    setSelectedUnit(unit: WarehouseUnit) {
        this.selectedUnit.set(unit);
    }

    setWarehouseCard(card: WarehouseCard) {
        this.warehouseCard.set(card);
    }

    getAllWarehouseItems() {
        const url = this.BASE_ROUTE + `Warehouse/GetAllWarehouseItems`;
        return this.http.get<Response>(url);
    }

    getInitialWarehouseState(destination: string, montYear: string) {
        const url = this.BASE_ROUTE + `Warehouse/GetInitialWarehouseState?destination=${destination}&monthYear=${montYear}`;
        return this.http.get<Response>(url);
    }

    createWarehouseItem(data: WarehouseItem) {
        const url = this.BASE_ROUTE + `Warehouse/CreateWarehouseItem`;
        return this.http.post<Response>(url, data);
    }

    updateWarehouseItem(data: WarehouseItem) {
        const url = this.BASE_ROUTE + `Warehouse/UpdateWarehouseItem`;
        return this.http.post<Response>(url, data);
    }

    deleteWarehouseItem(id: number) {
        const url = this.BASE_ROUTE + `Warehouse/DeleteWarehouseItem?id=${id}`;
        return this.http.delete<Response>(url);
    }

    reorderWarehouseItems(data: WarehouseItem[]) {
        const url = this.BASE_ROUTE + `Warehouse/ReorderWarehouseItems`;
        return this.http.post<Response>(url, data);
    }

    getWarehouseCard(monthYear: string, destination: string, warehouseItemId: number) {
        const url = this.BASE_ROUTE + `Warehouse/GetWarehouseCard?monthYear=${monthYear}&destination=${destination}&warehouseItemId=${warehouseItemId}`;
        return this.http.get<Response>(url);
    }

    getWarehouseCards(monthYear: string, destination: string) {
        const url = this.BASE_ROUTE + `Warehouse/GetWarehouseCards?monthYear=${monthYear}&destination=${destination}`;
        return this.http.get<Response>(url);
    }

    createUpdateWarehouseCard(card: WarehouseCard) {
        const url = this.BASE_ROUTE + `Warehouse/CreateUpdateWarehouseCard`;
        return this.http.post<Response>(url, card);
    }

    clearWarehouseUnit(unit: WarehouseUnit) {
        let card = { ...this.warehouseCard() };
        let _unit = card.units.find(x => x.date === unit.date);
        const index = card.units.indexOf(_unit!);
        card.units[index].amount = undefined;
        const url = this.BASE_ROUTE + `Warehouse/CreateUpdateWarehouseCard`;
        return this.http.post<Response>(url, card);
    }

    getCard() {
        return { ...this.warehouseCard() };
    }

    updateWidgetPosition(sourceWidgetId: number, targetWidgetId: number) {
        const sourceIndex = this.items().findIndex((w) => w.position === sourceWidgetId);
        if (sourceIndex === -1) {
            return;
        }
        const newWidgets = [...this.items()];
        const sourceWidget = newWidgets.splice(sourceIndex, 1)[0];
        const targetIndex = newWidgets.findIndex((w) => w.position === targetWidgetId);

        if (targetIndex === -1) {
            return;
        }
        const insertAt = targetIndex === sourceIndex ? targetIndex + 1 : targetIndex;
        newWidgets.splice(insertAt, 0, sourceWidget);
        this.items.set(newWidgets);
    }
}