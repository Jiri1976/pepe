import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { initialSignalRSlice, SignalRSlice } from './with-signalR.slice';
import { joinRoom } from './with-signalR.helpers';
import * as signalR from '@microsoft/signalr';
import {
  WarehouseCard,
  WarehouseItem,
} from '../../../models/warehouses.interface';
import { removeNotifications } from './with-signalR.updaters';
import { User } from '../../../models/users.interface';
import { ShiftCard, TodaysShifts } from '../../../models/shifts.interface';
import { ProposalCard } from '../../../models/proposals.interface';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export function withSignalR(): SignalStoreFeature<
  { state: {}; props: {}; methods: {} },
  {
    state: SignalRSlice;
    props: {};
    methods: {
      setToken: (token: string) => void;
      setSignalRUser: (user: {
        name: string;
        destination?: string | null;
        role?: string | null;
      }) => void;
      clearSignalRUser: () => void;
      start: () => void;
      leaveRoom: () => void;
      clearWarehouseCards: () => void;
      clearWarehouseItems: () => void;
      clearUsers: () => void;
      removeNotifications: (index: number) => void;
      connectAndJoin: () => void;
      clearSchedules: () => void;
      clearShifts: () => void;
      clearTodayShifts: () => void;
      clearProposals: () => void;
      addNotifications: (message: string) => void;
    };
  }
> {
  return signalStoreFeature(
    withState({
      ...initialSignalRSlice,
    }),

    withProps((store) => ({
      connection: new signalR.HubConnectionBuilder()
        .withUrl(initialSignalRSlice.pepeHUb, {
          accessTokenFactory: () => store.token() ?? '',
        })
        .configureLogging(signalR.LogLevel.Error)
        .withAutomaticReconnect()
        .build(),
    })),
    withMethods((store) => {
      const _router = inject(Router);
      let currentUser = {
        name: '',
      };
      let connectPromise: Promise<boolean> | null = null;
      let reconnectHandlersRegistered = false;

      const leaveRoom = async () => {
        try {
          connectPromise = null;
          currentUser = { name: '' };
          return store.connection.stop();
        } catch (error) {
          console.log('WAREHOUSE LEAVE CHAT ERROR: ', error);
        }
      };

      const waitForConnected = (timeoutMs = 7000): Promise<boolean> => {
        return new Promise((resolve) => {
          const started = Date.now();
          const timer = setInterval(() => {
            if (
              store.connection.state === signalR.HubConnectionState.Connected
            ) {
              clearInterval(timer);
              resolve(true);
              return;
            }
            if (Date.now() - started >= timeoutMs) {
              clearInterval(timer);
              resolve(false);
            }
          }, 100);
        });
      };

      const connectAndJoin = async (): Promise<boolean> => {
        const name = currentUser.name;

        if (!name) {
          return false;
        }

        if (store.connection.state === signalR.HubConnectionState.Connected) {
          return true;
        }
        if (
          store.connection.state === signalR.HubConnectionState.Disconnected
        ) {
          const room = 'pepepizza';
          await store.connection.start();
          registerWarehouseCardsListener();
          registerWarehouseItemsListener();
          registerUsersListener();
          registerShiftsListener();
          registerProposalsListener();
          registerTodaysShiftsListener();
          await joinRoom(store.connection, name, room);
          return true;
        }
        return waitForConnected();
      };

      const ensureConnected = async (): Promise<boolean> => {
        if (store.connection.state === signalR.HubConnectionState.Connected) {
          return true;
        }

        if (connectPromise) {
          return connectPromise;
        }

        if (
          store.connection.state === signalR.HubConnectionState.Disconnected
        ) {
          connectPromise = connectAndJoin().finally(() => {
            connectPromise = null;
          });
          return connectPromise;
        }
        return waitForConnected();
      };

      const registerReconnectHandlers = () => {
        if (reconnectHandlersRegistered) {
          return;
        }
        reconnectHandlersRegistered = true;

        store.connection.onreconnected(async () => {
          try {
            registerWarehouseCardsListener();
            registerWarehouseItemsListener();
            registerUsersListener();
            registerShiftsListener();
            registerProposalsListener();
            registerTodaysShiftsListener();
            if (currentUser.name) {
              const room = 'pepepizza';
              await joinRoom(store.connection, currentUser.name, room);
            }
          } catch (error) {
            console.log('WAREHOUSE SIGNALR REJOIN ERROR: ', error);
          }
        });
      };

      const registerWarehouseCardsListener = () => {
        store.connection.off('SendWarehouseCards');
        store.connection.on(
          'SendWarehouseCards',
          (user: string, cards: WarehouseCard[], message: string) => {
            if (user !== currentUser.name) {
              if (
                _router.url === '/warehouse' ||
                _router.url === '/warehouse/warehouse-units'
              ) {
                patchState(store, {
                  sWarehouseCards: cards,
                  sWarehouseMessage: message,
                });
              }
            }
          },
        );
      };

      const registerWarehouseItemsListener = () => {
        store.connection.off('SendWarehouseItems');
        store.connection.on(
          'SendWarehouseItems',
          (user: string, items: WarehouseItem[], message: string) => {
            if (
              user !== currentUser.name &&
              _router.url === '/warehouse/warehouse-items'
            ) {
              const nextNotifications = [message, ...store.notifications()];
              patchState(store, {
                sWarehouseItems: items,
                notifications: nextNotifications,
              });
            }
          },
        );
      };

      const registerUsersListener = () => {
        store.connection.off('SendUsers');
        store.connection.on(
          'SendUser',
          (action: string, user: string, userObj: User, message: string) => {
            if (user !== currentUser.name) {
              if (_router.url === '/users') {
                const nextNotifications = [message, ...store.notifications()];
                patchState(store, {
                  notifications: nextNotifications,
                  sUser: userObj,
                  sAction: action,
                });
              }
            }
          },
        );
      };

      const registerShiftsListener = () => {
        store.connection.off('SendShifts');
        store.connection.on(
          'SendShifts',
          (user: string, cards: ShiftCard[], message: string) => {
            if (user !== currentUser.name) {
              if (_router.url === '/shifts') {
                patchState(store, {
                  sCards: cards,
                  sShiftMessage: message,
                });
              }
            }
          },
        );
      };

      const registerTodaysShiftsListener = () => {
        store.connection.off('SendTodaysShifts');
        store.connection.on(
          'SendTodaysShifts',
          (
            user: string,
            sTodaysShifts: TodaysShifts,
            sTodaysMessage: string,
            sTodaysDestination: string,
          ) => {
            if (user !== currentUser.name) {
              if (_router.url === '/shifts/daily') {
                patchState(store, {
                  sTodaysShifts: sTodaysShifts,
                  sTodaysMessage: sTodaysMessage,
                  sTodaysDestination: sTodaysDestination,
                });
              }
            }
          },
        );
      };

      const registerProposalsListener = () => {
        store.connection.off('UpdateProposals');
        store.connection.on(
          'UpdateProposals',
          (user: string, cards: ProposalCard[], message: string) => {
            if (user !== currentUser.name) {
              if (_router.url === '/plans') {
                patchState(store, {
                  sProposals: cards,
                  sProposalMessage: message,
                });
              }
            }
          },
        );
      };

      const addNotifications = (message: string) => {
        const nextNotifications = [message, ...store.notifications()];
        patchState(store, {
          notifications: nextNotifications,
        });
      };

      return {
        setToken: (token: string) => patchState(store, { token }),
        setSignalRUser: (user: { name: string }) => {
          currentUser = {
            name: user.name,
          };
        },
        clearSignalRUser: () => {
          currentUser = { name: '' };
        },
        leaveRoom: async () => await leaveRoom(),
        start: async () => {
          try {
            registerReconnectHandlers();
            const isConnected = await ensureConnected();
            if (!isConnected) {
              console.log('WAREHOUSE SERVICE - Hub connection timeout.');
            }
          } catch (error) {
            console.log(
              'WAREHOUSE SERVICE - Nepodařilo se navázat spojení s hubem.',
            );
          }
        },
        clearWarehouseCards: () =>
          patchState(store, { sWarehouseCards: [], sWarehouseMessage: null }),
        clearWarehouseItems: () => patchState(store, { sWarehouseItems: [] }),
        removeNotifications: (index: number) => {
          patchState(store, removeNotifications(index));
        },
        connectAndJoin: async () => await connectAndJoin(),
        clearUsers: () => patchState(store, { sUser: null, sAction: null }),
        clearSchedules: () =>
          patchState(store, { sProposals: [], sProposalMessage: null }),
        clearShifts: () =>
          patchState(store, { sCards: null, sShiftMessage: null }),
        clearProposals: () => patchState(store, { sProposals: null }),
        addNotifications: (message: string) => addNotifications(message),
        clearTodayShifts: () =>
          patchState(store, {
            sTodaysShifts: null,
            sTodaysMessage: null,
            sTodaysDestination: null,
          }),
      };
    }),
  );
}
