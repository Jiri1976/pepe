// import { effect, inject, Injectable, signal } from '@angular/core';
// import { environment } from '../../environments/environment';
// import * as signalR from '@microsoft/signalr';
// import { WarehouseService } from './warehouse.service';
// import { UsersStore } from '../stores/user-store/users.store';
// import { timeout } from 'rxjs';
// import { AuthStore } from '../stores/auth-store/auth.store';
// import { WarehouseCard } from '../models/warehouses.interface';
// import { saveNotifications } from '../stores/custome-features/wirh-signalR/with-signalR.helpers';

// @Injectable({
//     providedIn: 'root'
// })
// export class SignalService {
//     private PEPE_HUB = environment.PEPE_HUB;
//     readonly auth = inject(AuthStore);
//     // readonly auth = inject(AuthStore);

//     userRole = signal<string>('');
//     userName = signal<string>('');
//     userDestination = signal<string>('');
//     token = signal<string>('');
//     hubUser = `${this.userName()}`;

//     wCards = signal<string[]>([]);

//     connection = new signalR.HubConnectionBuilder()
//         .withUrl(this.PEPE_HUB, {
//             accessTokenFactory: () => this.token()
//         })
//         .configureLogging(signalR.LogLevel.Error)
//         .withAutomaticReconnect()
//         .build();

//     userEffect = effect(() => {
//         // if (this.userName() !== '') {
//         //     this.hubUser = `${this.userName()}`;
//         //     this.start();
//         //     this.connection.off("SendWarehouseCards");
//         //     this.connection.on("SendWarehouseCards", (user: string, isUpdate: boolean, destination: string, messageTime: string, updateItems: boolean) => {
//         //         const hours = new Date(messageTime).getHours();
//         //         const minutes = new Date(messageTime).getMinutes() < 10 ? `0${new Date(messageTime).getMinutes()}` : new Date(messageTime).getMinutes();

//         //         if (isUpdate && user !== this.hubUser && this.userRole() === 'Admin' && !updateItems) {
//         //             // if (destination === this.warehouseService.destination()) {
//         //             //     this.warehouseService.reloadCards.set(true);
//         //             // }
//         //             //this.toaster.checkNotifications(`${hours}:${minutes} Sklad pro ${destination} upraven - ${user}.`, `Sklad pro ${destination} upraven - ${user}`);
//         //         }

//         //         if (isUpdate && user !== this.hubUser && this.userRole() === 'Master' && !updateItems && this.userDestination() === destination) {
//         //             // this.warehouseService.reloadCards.set(true);
//         //             //this.toaster.checkNotifications(`${hours}:${minutes} Skladové položky upraveny - ${user}.`, `Skladové položky upraveny - ${user}`);
//         //         }

//         //         if (!isUpdate && user !== this.hubUser && this.userRole() === 'Admin' && updateItems) {
//         //             // this.warehouseService.reloadCards.set(true);
//         //             //this.toaster.checkNotifications(`${hours}:${minutes} Skladové položky upraveny - ${user}.`, `Skladové položky upraveny - ${user}`);
//         //         }

//         //         if (!isUpdate && user !== this.hubUser && this.userRole() === 'Master' && updateItems) {
//         //             // this.warehouseService.reloadCards.set(true);
//         //             //this.toaster.checkNotifications(`${hours}:${minutes} Skladové položky upraveny - ${user}.`, `Skladové položky upraveny - ${user}`);
//         //         }
//         //     });
//         // }

//         if (this.auth.user()) {
//             // this.hubUser = this.auth.user()!.name;
//             this.token.set(this.auth.user()!.token);
//             this.start();
//             this.connection.off("SendWarehouseCards");

//             this.connection.on("SendWarehouseCards", (destination: string, cards: WarehouseCard[], message: string) => {
//                 try {
//                     const nextNotifications = [...this.auth.notifications(), message];
//                     //patchState(store, { wCards: cards, notifications: nextNotifications });
//                     saveNotifications(nextNotifications);
//                     console.log('WAREHOUSE CARDS EVENT: ', destination, cards, message);
//                 } catch (error) {
//                     console.log('ERROR HANDLING WAREHOUSE CARDS EVENT: ', error);
//                 }

//             });


//             //this.connection.on("SendWarehouseCards", (user: string, isUpdate: boolean, destination: string, messageTime: string, updateItems: boolean) => {
//             //     const hours = new Date(messageTime).getHours();
//             //     const minutes = new Date(messageTime).getMinutes() < 10 ? `0${new Date(messageTime).getMinutes()}` : new Date(messageTime).getMinutes();

//             //     if (isUpdate && user !== this.hubUser && this.userRole() === 'Admin' && !updateItems) {
//             //         // if (destination === this.warehouseService.destination()) {
//             //         //     this.warehouseService.reloadCards.set(true);
//             //         // }
//             //         //this.toaster.checkNotifications(`${hours}:${minutes} Sklad pro ${destination} upraven - ${user}.`, `Sklad pro ${destination} upraven - ${user}`);
//             //     }

//             //     if (isUpdate && user !== this.hubUser && this.userRole() === 'Master' && !updateItems && this.userDestination() === destination) {
//             //         // this.warehouseService.reloadCards.set(true);
//             //         //this.toaster.checkNotifications(`${hours}:${minutes} Skladové položky upraveny - ${user}.`, `Skladové položky upraveny - ${user}`);
//             //     }

//             //     if (!isUpdate && user !== this.hubUser && this.userRole() === 'Admin' && updateItems) {
//             //         // this.warehouseService.reloadCards.set(true);
//             //         //this.toaster.checkNotifications(`${hours}:${minutes} Skladové položky upraveny - ${user}.`, `Skladové položky upraveny - ${user}`);
//             //     }

//             //     if (!isUpdate && user !== this.hubUser && this.userRole() === 'Master' && updateItems) {
//             //         // this.warehouseService.reloadCards.set(true);
//             //         //this.toaster.checkNotifications(`${hours}:${minutes} Skladové položky upraveny - ${user}.`, `Skladové položky upraveny - ${user}`);
//             //     }
//             // });
//         }
//     });

//     constructor() {

//         const token = localStorage.getItem('token');

//         // const localStorageUserName = localStorage.getItem('userName');
//         // const localStorageUserRole = localStorage.getItem('userRole');
//         // const localStorageUserDestination = localStorage.getItem('userDestination');
//         // if (token && localStorageUserName && localStorageUserRole && localStorageUserDestination) {
//         //     this.token.set(token);
//         //     this.userDestination.set(localStorageUserDestination);
//         //     this.userRole.set(localStorageUserRole);
//         //     this.userName.set(localStorageUserName);
//         // }

//         if (token) {
//             this.token.set(token);
//         }

//         window.addEventListener('beforeunload', () => {
//             this.leaveRoom();
//         });
//     }

//     async sendWarehouseCards(destination: string, cards: WarehouseCard[], message: string) {
//         try {
//             // console.log('TOKEN', this.connection);
//             console.log('MESSAGE: ', message);
//             console.log('cards: ', cards);


//             return this.connection.invoke("SendWarehouseCards", destination, cards, message);
//         } catch (error) {
//             console.log('WAREHOUSE SEND CARDS ERROR: ', error);
//         }
//     }

//     async leaveRoom() {
//         try {
//             return this.connection.stop();
//         } catch (error) {
//             console.log('WAREHOUSE LEAVE CHAT ERROR: ', error);
//         }
//     }

//     private async start() {
//         try {
//             if (this.connection.state !== signalR.HubConnectionState.Disconnected) {
//                 await this.leaveRoom();
//             }
//             await this.connection.start();
//             // await this.joinRoom(this.hubUser, 'pepepizza');
//             await this.joinRoom(this.auth.user()!.name, 'pepepizza');
//         } catch (error) {
//             console.log('WAREHOUSE SERVICE - Nepodařilo se navázat spojení s hubem.');
//         }
//     }

//     private async joinRoom(user: string, room: string) {
//         try {
//             console.log('connected');
//             return this.connection.invoke("JoinRoom", { user, room });
//         } catch (error) {
//             console.log('WAREHOUSE JOIN ROOM ERROR: ', error);
//         }
//     }
// }