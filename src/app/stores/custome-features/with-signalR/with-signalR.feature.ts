import { patchState, signalStoreFeature, SignalStoreFeature, withMethods, withProps, withState } from "@ngrx/signals";
import { initialSignalRSlice, SignalRSlice } from "./with-signalR.slice";
import { joinRoom } from "./with-signalR.helpers";
import * as signalR from '@microsoft/signalr';
import { WarehouseCard, WarehouseItem } from "../../../models/warehouses.interface";
import { removeNotifications } from "./with-signalR.updaters";
import { isCurrentMonthYear } from "../../../helpers/common-functions.helper";
import { User } from "../../../models/users.interface";
import { ShiftCard } from "../../../models/shifts.interface";
import { ProposalCard } from "../../../models/proposals.interface";

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
            clearUsers: () => void;
            sendUsers: (user: string, destination: string, users: User[], message: string) => void;
            removeNotifications: (index: number) => void;
            connectAndJoin: () => void;
            setUpdateSignalRProposalsToFalse: () => void;
            clearSchedules: () => void;
            setUpdateShiftsToFalse: () => void;
            clearShifts: () => void;
            sendShifts: (user: string, destination: string, card: ShiftCard, message: string) => void;
            updateSignalProposals: (user: string, destination: string, cards: ProposalCard[], message: string) => void;
            clearProposals: () => void;
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
                    registerUsersListener();
                    registerShiftsListener();
                    registerProposalsListener();
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

            const forceReconnect = async (): Promise<boolean> => {
                try {
                    if (store.connection.state !== signalR.HubConnectionState.Disconnected) {
                        await store.connection.stop();
                    }
                } catch {
                    // Ignore stop errors and continue with a clean reconnect attempt.
                }

                try {
                    return await connectAndJoin();
                } catch {
                    return false;
                }
            };

            const isConnectionClosedError = (error: unknown): boolean => {
                const msg = String(error ?? '').toLowerCase();
                return msg.includes('connection closed') || msg.includes('closed with an error');
            };

            const normalizeProposalPayload = (cards: ProposalCard[]): ProposalCard[] => {
                try {
                    const json = JSON.stringify(cards);
                    const payloadBytes = new TextEncoder().encode(json).length;

                    if (payloadBytes > 700000) {
                        return [];
                    }
                    return cards;
                } catch {
                    return [];
                }
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

            const registerUsersListener = () => {
                store.connection.off("SendUsers");
                store.connection.on("SendUsers", (user: string, destination: string, users: User[], message: string) => {
                    if (user !== currentUser.name) {
                        const nextNotifications = [message, ...store.notifications()];
                        if ((currentUser.role === 'Master' && currentUser.destination === destination) || (currentUser.role === 'Master' && destination === 'all')) {
                            patchState(store, { sUsers: users, notifications: nextNotifications, updateSignalRProposals: true, updateShifts: true });
                        } else if (currentUser.role === 'Admin') {
                            patchState(store, { sUsers: users, notifications: nextNotifications, updateSignalRProposals: true, updateShifts: true });
                        }
                    }
                });
            };

            const registerShiftsListener = () => {
                store.connection.off("SendShifts");
                store.connection.on("SendShifts", (user: string, destination: string, card: ShiftCard, message: string) => {
                    if (user !== currentUser.name) {
                        const nextNotifications = [message, ...store.notifications()];
                        if (currentUser.role === 'Master' && currentUser.destination === destination) {
                            patchState(store, { sCard: card, notifications: nextNotifications });
                        } else if (currentUser.role === 'Admin') {
                            patchState(store, { sCard: card, notifications: nextNotifications });
                        }
                    }
                });
            };

            const registerProposalsListener = () => {
                store.connection.off("UpdateProposals");
                store.connection.on("UpdateProposals", (user: string, destination: string, cards: ProposalCard[], message: string) => {
                    if (user !== currentUser.name) {
                        const nextNotifications = [message, ...store.notifications()];
                        if ((currentUser.role === 'Master' && currentUser.destination === destination) || (currentUser.role === 'Master' && destination === 'all')) {
                            patchState(store, { sProposals: cards, notifications: nextNotifications, updateSignalRProposals: true });
                        } else if (currentUser.role === 'Admin') {
                            patchState(store, { sProposals: cards, notifications: nextNotifications, updateSignalRProposals: true });
                        }
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
                sendUsers: async (user: string, destination: string, users: User[], message: string) => {
                    try {
                        const isConnected = await ensureConnected();

                        if (!isConnected) {
                            console.log('SEND USERS ERROR: Connection is not ready.');
                            return;
                        }
                        return await store.connection.invoke("SendUsers", user, destination, users, message);
                    } catch (error) {
                        if (isConnectionClosedError(error)) {
                            const reconnected = await ensureConnected();
                            if (reconnected) {
                                try {
                                    return await store.connection.invoke("SendUsers", user, destination, users, message);
                                } catch (retryError) {
                                    console.log('SEND USERS RETRY ERROR: ', retryError);
                                    return;
                                }
                            }
                        }
                        console.log('SEND USERS ERROR: ', error);
                    }
                },
                sendShifts: async (user: string, destination: string, card: ShiftCard, message: string) => {
                    try {
                        const isConnected = await ensureConnected();

                        if (!isConnected) {
                            console.log('SEND SHIFTS ERROR: Connection is not ready.');
                            return;
                        }
                        return await store.connection.invoke("SendShifts", user, destination, card, message);
                    } catch (error) {
                        if (isConnectionClosedError(error)) {
                            const reconnected = await ensureConnected();
                            if (reconnected) {
                                try {
                                    return await store.connection.invoke("SendShifts", user, destination, card, message);
                                } catch (retryError) {
                                    console.log('SEND SHIFTS RETRY ERROR: ', retryError);
                                    return;
                                }
                            }
                        }
                        console.log('SEND SHIFTS ERROR: ', error);
                    }
                },
                updateSignalProposals: async (user: string, destination: string, cards: ProposalCard[], message: string) => {
                    const signalPayload = normalizeProposalPayload(cards);

                    try {
                        const isConnected = await ensureConnected();

                        if (!isConnected) {
                            console.log('SEND PROPOSALS ERROR: Connection is not ready.');
                            return;
                        }
                        return await store.connection.invoke("UpdateProposals", user, destination, signalPayload, message);
                    } catch (error) {
                        if (isConnectionClosedError(error)) {
                            const reconnected = await forceReconnect();
                            if (reconnected) {
                                try {
                                    return await store.connection.invoke("UpdateProposals", user, destination, signalPayload, message);
                                } catch (retryError) {
                                    console.log('SEND PROPOSALS RETRY ERROR: ', retryError);
                                    return;
                                }
                            }
                        }
                        console.log('SEND PROPOSALS ERROR: ', error);
                    }
                },
                clearWarehouseCards: () => patchState(store, { wCards: [] }),
                clearWarehouseItems: () => patchState(store, { wItems: [] }),
                removeNotifications: (index: number) => { patchState(store, removeNotifications(index)) },
                connectAndJoin: async () => await connectAndJoin(),
                clearUsers: () => patchState(store, { sUsers: [] }),
                setUpdateSignalRProposalsToFalse: () => patchState(store, { updateSignalRProposals: false }),
                clearSchedules: () => patchState(store, { sProposals: [] }),
                setUpdateShiftsToFalse: () => patchState(store, { updateShifts: false }),
                clearShifts: () => patchState(store, { sCard: null }),
                clearProposals: () => patchState(store, { sProposals: null }),
            };
        })
    );
}

