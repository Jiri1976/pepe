import { effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import * as signalR from '@microsoft/signalr';
import { ToasterService } from './toaster.service';
import { WarehouseService } from './warehouse.service';

@Injectable({
    providedIn: 'root'
})
export class SignalService {
    private PEPE_HUB = environment.PEPE_HUB;
    private toaster = inject(ToasterService);
    private warehouseService = inject(WarehouseService);

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
                    if (destination === this.warehouseService.destination()) {
                        this.warehouseService.reloadCards.set(true);
                    }
                    this.toaster.checkNotifications(`${hours}:${minutes} Sklad pro ${destination} upraven - ${user}.`, `Sklad pro ${destination} upraven - ${user}`);
                }

                if (isUpdate && user !== this.hubUser && this.userRole() === 'Master' && !updateItems && this.userDestination() === destination) {
                    this.warehouseService.reloadCards.set(true);
                    this.toaster.checkNotifications(`${hours}:${minutes} Skladové položky upraveny - ${user}.`, `Skladové položky upraveny - ${user}`);
                }

                if (!isUpdate && user !== this.hubUser && this.userRole() === 'Admin' && updateItems) {
                    this.warehouseService.reloadCards.set(true);
                    this.toaster.checkNotifications(`${hours}:${minutes} Skladové položky upraveny - ${user}.`, `Skladové položky upraveny - ${user}`);
                }

                if (!isUpdate && user !== this.hubUser && this.userRole() === 'Master' && updateItems) {
                    this.warehouseService.reloadCards.set(true);
                    this.toaster.checkNotifications(`${hours}:${minutes} Skladové položky upraveny - ${user}.`, `Skladové položky upraveny - ${user}`);
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

    private async start() {
        try {
            if (this.connection.state !== signalR.HubConnectionState.Disconnected) {
                await this.leaveRoom();
            }
            await this.connection.start();
            await this.joinRoom(this.hubUser, 'warehouse');
        } catch (error) {
            console.log('WAREHOUSE SERVICE - Nepodařilo se navázat spojení s hubem.');
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