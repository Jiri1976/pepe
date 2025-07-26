import { effect, inject, Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Response } from '../models/response.interface';
import { WarehouseItem } from "../models/warehouse/warehouse-item.interface";
import { WarehouseUnit } from "../models/warehouse/warehouse-unit.interface";
import { WarehouseCard } from "../models/warehouse/warehouse-card.interface";
import { BehaviorSubject, Observable } from "rxjs";
import { WarehouseItemsComponent } from "../components/warehouse/warehouse-items/warehouse-items.component";

import * as signalR from '@microsoft/signalr';
import { AlertService } from "./alert.service";

@Injectable({
    providedIn: 'root'
})
export class WarehouseService {
    private PEPE_HUB = environment.PEPE_HUB;
    private MONTHS_NUM = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    private http = inject(HttpClient);
    private BASE_ROUTE = environment.WAREHOUSE_PATH;
    private compRef = new BehaviorSubject<WarehouseItemsComponent | null>(null);
    private alertService = inject(AlertService);
    items = signal<WarehouseItem[]>([]);
    warehouseCard = signal<WarehouseCard>({ id: 0, warehouseItemId: 0, warehouseItemName: '', monthYear: '', monthYearName: '', destination: '', units: [] });
    selectedUnit = signal<WarehouseUnit>({ id: 0, warehouseCardId: 0, warehouseItemId: 0, date: '', amount: 0 });
    selectedListItemId = signal<number>(-1);
    selectedIndex = signal<number>(0);
    isUpdating = signal(false);
    cards = signal<WarehouseCard[]>([]);
    reloadItems = signal(false);
    reloadCards = signal(false);
    monthYear = signal<string>(this.MONTHS_NUM[new Date().getMonth()] + new Date().getFullYear());
    destination = signal<string>('F-M');
    deleteCards = signal(false);
    warehouseNav = signal<'units' | 'items' | 'board'>('units');
    numberOfDays = signal<number>(31);
    userRole = signal<string>('');
    userName = signal<string>('');
    userDestination = signal<string>('');
    token = signal<string>('');
    hubUser = `${this.userName()}`;

    connection = new signalR.HubConnectionBuilder()
        .withUrl(this.PEPE_HUB, {
            accessTokenFactory: () => this.token()!
        })
        .configureLogging(signalR.LogLevel.Error)
        .withAutomaticReconnect()
        .build();

    userEffect = effect(() => {
        if (this.userName() !== '') {
            this.hubUser = `${this.userName()}`;
            this.start();
            this.connection.off("SendWarehouseCards");
            this.connection.on("SendWarehouseCards", (user: string, isUpdate: boolean, destination: string, messageTime: string, updateItems: boolean) => {
                const hours = new Date(messageTime).getHours();
                const minutes = new Date(messageTime).getMinutes() < 10 ? `0${new Date(messageTime).getMinutes()}` : new Date(messageTime).getMinutes();

                if (isUpdate && user !== this.hubUser && this.userRole() === 'Admin' && !updateItems) {
                    if (destination === this.destination()) {
                        this.reloadCards.set(true);
                    }
                    this.alertService.checkNotifications(`${hours}:${minutes} Sklad pro ${destination} upraven - ${user}.`, `Sklad pro ${destination} upraven - ${user}`);
                }

                if (isUpdate && user !== this.hubUser && this.userRole() === 'Master' && !updateItems && this.userDestination() === destination) {
                    this.reloadCards.set(true);
                    this.alertService.checkNotifications(`${hours}:${minutes} Skladové položky upraveny - ${user}.`, `Skladové položky upraveny - ${user}`);
                }

                if (!isUpdate && user !== this.hubUser && this.userRole() === 'Admin' && updateItems) {
                    this.reloadCards.set(true);
                    this.alertService.checkNotifications(`${hours}:${minutes} Skladové položky upraveny - ${user}.`, `Skladové položky upraveny - ${user}`);
                }

                if (!isUpdate && user !== this.hubUser && this.userRole() === 'Master' && updateItems) {
                    this.reloadCards.set(true);
                    this.alertService.checkNotifications(`${hours}:${minutes} Skladové položky upraveny - ${user}.`, `Skladové položky upraveny - ${user}`);
                }
            });
        }
    });

    constructor() {
        const token = localStorage.getItem('token');
        const localStorageUserName = localStorage.getItem('userName');
        const localStorageUserRole = localStorage.getItem('userRole');
        const localStorageUserDestination = localStorage.getItem('userDestination');
        if (token && localStorageUserName && localStorageUserRole && localStorageUserDestination) {
            this.token.set(token);
            this.userDestination.set(localStorageUserDestination);
            this.userRole.set(localStorageUserRole);
            this.userName.set(localStorageUserName);
        }

        window.addEventListener('beforeunload', () => {
            this.leaveRoom();
        });
    }

    async sendCards(destination: string, isUpdating: boolean, updateItems: boolean) {
        try {
            return this.connection.invoke("SendWarehouseCards", destination, isUpdating, updateItems);
        } catch (error) {
            console.log('WAREHOUSE SEND CARDS ERROR: ', error);
        }
    }

    async leaveRoom() {
        try {
            return this.connection.stop();
        } catch (error) {
            console.log('WAREHOUSE LEAVE CHAT ERROR: ', error);
        }
    }

    setComponent(comp: WarehouseItemsComponent) {
        this.compRef.next(comp);
    }

    getComponent(): Observable<WarehouseItemsComponent | null> {
        return this.compRef.asObservable();
    }

    callOnAddItem() {
        const comp = this.compRef.getValue();
        comp?.onAddItem();
    }

    setItems(_items: WarehouseItem[]) {
        this.items.set(_items);
    }

    getAllWarehouseItems() {
        const url = this.BASE_ROUTE + `Warehouse/GetAllWarehouseItems`;
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

    updateWarehouseCards(cards: WarehouseCard[]) {
        const url = this.BASE_ROUTE + `Warehouse/UpdateWarehouseCards`;
        return this.http.post<Response>(url, cards);
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

    createPDF(cards: WarehouseCard[]) {
        const url = this.BASE_ROUTE + `Warehouse/createPDF`;
        return this.http.post<Response>(url, cards);
    }

    deleteWarehouseCard(id: number) {
        const url = this.BASE_ROUTE + `Warehouse/deleteWarehouseCard?id=${id}`;
        return this.http.delete<Response>(url);
    }

    deleteWarehouseCards(monthYear: string, destination: string) {
        const url = this.BASE_ROUTE + `Warehouse/deleteWarehouseCards?monthYear=${monthYear}&destination=${destination}`;
        return this.http.delete<Response>(url);
    }

    private async start() {
        try {
            if (this.connection.state !== signalR.HubConnectionState.Disconnected) {
                await this.leaveRoom();
            }
            await this.connection.start();
            await this.joinRoom(this.hubUser, 'warehouse');
        } catch (error) {
            this.alertService.setAlert({
                severity: 'warn',
                summary: 'Warn',
                detail: 'Nepodařilo se navázat spojení s hubem.'
            });
        }
    }

    private async joinRoom(user: string, room: string) {
        try {
            return this.connection.invoke("JoinRoom", { user, room });
        } catch (error) {
            console.log('WAREHOUSE JOIN ROOM ERROR: ', error);
        }
    }
}