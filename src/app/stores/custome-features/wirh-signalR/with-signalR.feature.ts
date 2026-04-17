import { patchState, signalStoreFeature, SignalStoreFeature, withMethods, withProps, withState } from "@ngrx/signals";
import { initialSignalRSlice, SignalRSlice } from "./with-signalR.slice";
import { joinRoom } from "./with-signalR.helpers";
import * as signalR from '@microsoft/signalr';
import { WarehouseCard, WarehouseItem } from "../../../models/warehouses.interface";
import { removeNotifications } from "./with-signalR.updaters";
import { isCurrentMonthYear } from "../../../helpers/common-functions.helper";

export function withSignalR(): SignalStoreFeature<
    { state: {}; props: {}; methods: {} },
    {
        state: SignalRSlice;
        props: {};
        methods: {
            setToken: (token: string) => void;
            setSignalRUser: (user: { name: string; destination?: string | null; role?: string | null }) => void;
            clearSignalRUser: () => void;
            start: () => void;
            leaveRoom: () => void;
            sendWarehouseCards: (user: string, destination: string, cards: WarehouseCard[], message: string) => void;
            clearWarehouseCards: () => void;
            sendWarehouseItems: (user: string, items: WarehouseItem[], message: string) => void;
            clearWarehouseItems: () => void;
            removeNotifications: (index: number) => void;
            connectAndJoin: () => void;
        };
    }
> {
    return signalStoreFeature(
        withState({
            ...initialSignalRSlice
        }),

        withProps((store) => ({

            connection: new signalR.HubConnectionBuilder()
                .withUrl(initialSignalRSlice.pepeHUb, {
                    accessTokenFactory: () => store.token() ?? ''
                })
                .configureLogging(signalR.LogLevel.Error)
                .withAutomaticReconnect()
                .build()

        })),
        withMethods(store => {
            let currentUser = {
                name: '',
                destination: null as string | null,
                role: null as string | null
            };
            let connectPromise: Promise<boolean> | null = null;
            let reconnectHandlersRegistered = false;

            const leaveRoom = async () => {
                try {
                    connectPromise = null;
                    currentUser = { name: '', destination: null, role: null };
                    return store.connection.stop();
                } catch (error) {
                    console.log('WAREHOUSE LEAVE CHAT ERROR: ', error);
                }
            };

            const waitForConnected = (timeoutMs = 7000): Promise<boolean> => {
                return new Promise((resolve) => {
                    const started = Date.now();
                    const timer = setInterval(() => {
                        if (store.connection.state === signalR.HubConnectionState.Connected) {
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
                if (store.connection.state === signalR.HubConnectionState.Disconnected) {
                    await store.connection.start();
                    registerWarehouseCardsListener();
                    registerWarehouseItemsListener();
                    await joinRoom(store.connection, name, 'pepepizza');
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

                if (store.connection.state === signalR.HubConnectionState.Disconnected) {
                    connectPromise = connectAndJoin()
                        .finally(() => {
                            connectPromise = null;
                        });
                    return connectPromise;
                }
                return waitForConnected();
            };

            const isConnectionClosedError = (error: unknown): boolean => {
                const msg = String(error ?? '').toLowerCase();
                return msg.includes('connection closed') || msg.includes('closed with an error');
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
                        if (currentUser.name) {
                            await joinRoom(store.connection, currentUser.name, 'pepepizza');
                        }
                    } catch (error) {
                        console.log('WAREHOUSE SIGNALR REJOIN ERROR: ', error);
                    }
                });
            };

            const registerWarehouseCardsListener = () => {
                store.connection.off("SendWarehouseCards");
                store.connection.on("SendWarehouseCards", (user: string, destination: string, cards: WarehouseCard[], message: string) => {
                    if (user !== currentUser.name) {
                        if (currentUser.role === 'Admin') {
                            const nextNotifications = [message, ...store.notifications()];
                            patchState(store, { wCards: cards, notifications: nextNotifications });
                        } else if (currentUser.role === 'Master' && destination === currentUser.destination) {
                            if (cards.length > 0 && isCurrentMonthYear(cards[0]?.monthYear)) {
                                const nextNotifications = [message, ...store.notifications()];
                                patchState(store, { wCards: cards, notifications: nextNotifications });
                            }
                        }

                        if (currentUser.role === 'Master' && destination === 'all') {
                            if (cards.length > 0 && isCurrentMonthYear(cards[0]?.monthYear)) {
                                const nextNotifications = [message, ...store.notifications()];
                                patchState(store, { wCards: cards, notifications: nextNotifications });
                            }
                        }
                    }
                });
            };

            const registerWarehouseItemsListener = () => {
                store.connection.off("SendWarehouseItems");
                store.connection.on("SendWarehouseItems", (user: string, items: WarehouseItem[], message: string) => {
                    if (user !== currentUser.name) {
                        const nextNotifications = [message, ...store.notifications()];
                        patchState(store, { wItems: items, notifications: nextNotifications });
                    }
                });
            };

            return {
                setToken: (token: string) => patchState(store, { token }),
                setSignalRUser: (user: { name: string; destination?: string | null; role?: string | null }) => {
                    currentUser = {
                        name: user.name,
                        destination: user.destination ?? null,
                        role: user.role ?? null
                    };
                },
                clearSignalRUser: () => {
                    currentUser = { name: '', destination: null, role: null };
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
                        console.log('WAREHOUSE SERVICE - Nepodařilo se navázat spojení s hubem.');
                    }
                },
                sendWarehouseCards: async (user: string, destination: string, cards: WarehouseCard[], message: string) => {
                    try {
                        const isConnected = await ensureConnected();

                        if (!isConnected) {
                            console.log('WAREHOUSE SEND CARDS ERROR: Connection is not ready.');
                            return;
                        }
                        return await store.connection.invoke("SendWarehouseCards", user, destination, cards, message);
                    } catch (error) {
                        if (isConnectionClosedError(error)) {
                            const reconnected = await ensureConnected();
                            if (reconnected) {
                                try {
                                    return await store.connection.invoke("SendWarehouseCards", user, destination, cards, message);
                                } catch (retryError) {
                                    console.log('WAREHOUSE SEND CARDS RETRY ERROR: ', retryError);
                                    return;
                                }
                            }
                        }
                        console.log('WAREHOUSE SEND CARDS ERROR: ', error);
                    }
                },
                sendWarehouseItems: async (user: string, items: WarehouseItem[], message: string) => {
                    try {
                        const isConnected = await ensureConnected();

                        if (!isConnected) {
                            console.log('WAREHOUSE SEND ITEMS ERROR: Connection is not ready.');
                            return;
                        }
                        return await store.connection.invoke("SendWarehouseItems", user, items, message);
                    } catch (error) {
                        if (isConnectionClosedError(error)) {
                            const reconnected = await ensureConnected();
                            if (reconnected) {
                                try {
                                    return await store.connection.invoke("SendWarehouseItems", user, items, message);
                                } catch (retryError) {
                                    console.log('WAREHOUSE SEND ITEMS RETRY ERROR: ', retryError);
                                    return;
                                }
                            }
                        }
                        console.log('WAREHOUSE SEND ITEMS ERROR: ', error);
                    }
                },
                clearWarehouseCards: () => patchState(store, { wCards: [] }),
                clearWarehouseItems: () => patchState(store, { wItems: [] }),
                removeNotifications: (index: number) => { patchState(store, removeNotifications(index)) },
                connectAndJoin: async () => { connectAndJoin() }
            };
        })
    );
}

