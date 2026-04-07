import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Response } from '../models/response.interface';
import { WarehouseItem, WarehouseCard } from "../models/warehouses.interface";

@Injectable({
    providedIn: 'root'
})
export class WarehouseService {
    private http = inject(HttpClient);
    private BASE_ROUTE = environment.WAREHOUSE_PATH;

    getAllWarehouseItems() {
        const url = this.BASE_ROUTE + `GetAllWarehouseItems`;
        return this.http.get<Response>(url);
    }

    createWarehouseItem(data: WarehouseItem) {
        const url = this.BASE_ROUTE + `CreateWarehouseItem`;
        return this.http.post<Response>(url, data);
    }

    updateWarehouseItem(data: WarehouseItem) {
        const url = this.BASE_ROUTE + `UpdateWarehouseItem`;
        return this.http.post<Response>(url, data);
    }

    deleteWarehouseItem(id: number) {
        const url = this.BASE_ROUTE + `DeleteWarehouseItem?id=${id}`;
        return this.http.delete<Response>(url);
    }

    reorderWarehouseItems(data: WarehouseItem[]) {
        const url = this.BASE_ROUTE + `ReorderWarehouseItems`;
        return this.http.post<Response>(url, data);
    }

    getWarehouseCard(monthYear: string, destination: string, warehouseItemId: number) {
        const url = this.BASE_ROUTE + `GetWarehouseCard?monthYear=${monthYear}&destination=${destination}&warehouseItemId=${warehouseItemId}`;
        return this.http.get<Response>(url);
    }

    getWarehouseCards(monthYear: string, destination: string) {
        const url = this.BASE_ROUTE + `GetWarehouseCards?monthYear=${monthYear}&destination=${destination}`;
        return this.http.get<Response>(url);
    }

    createUpdateWarehouseCard(card: WarehouseCard) {
        const url = this.BASE_ROUTE + `CreateUpdateWarehouseCard`;
        return this.http.post<Response>(url, card);
    }

    updateWarehouseCards(cards: WarehouseCard[]) {
        const url = this.BASE_ROUTE + `UpdateWarehouseCards`;
        return this.http.post<Response>(url, cards);
    }

    createPDF(cards: WarehouseCard[]) {
        const url = this.BASE_ROUTE + `createPDF`;
        return this.http.post<Response>(url, cards);
    }

    deleteWarehouseCard(id: number) {
        const url = this.BASE_ROUTE + `deleteWarehouseCard?id=${id}`;
        return this.http.delete<Response>(url);
    }

    deleteWarehouseCards(monthYear: string, destination: string) {
        const url = this.BASE_ROUTE + `deleteWarehouseCards?monthYear=${monthYear}&destination=${destination}`;
        return this.http.delete<Response>(url);
    }
}