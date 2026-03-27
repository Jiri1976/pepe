import { patchState, signalStore, withComputed, withMethods, withProps, withState } from "@ngrx/signals";
import { computed, inject, signal } from "@angular/core";
import { Dialog } from '@angular/cdk/dialog';
import { ToasterService } from "../../services/toaster.service";
import { withLoading } from "../custome-features/withLoading/with-loading.feature";
import { closeCalendar, toggleIsSaving, setIsLoading, toggleCalendar, toggleIsPdfLoading, toggleIsDeleting, toggleIsDeletingCard, toggleIsLoading, setNotLoading } from "../custome-features/withLoading/with-loading.updaters";
import { withConfirmation } from "../custome-features/withConfirmation/with-confirmation.feature";
import { ConfirmationStore } from "../custome-features/withConfirmation/confirmation.store";
import { CONFIRM_ACTIONS } from "../custome-features/withConfirmation/confirmation.actions";
import { MONTHS_NUM } from "../../helpers/common-constants.helper";
import { initialWarehouseSlice } from "./warehouse.slice";
import { WarehouseService } from "../../services/warehouse.service";
import { SignalService } from "../../services/signal.service";
import { Router } from "@angular/router";
import { updateCards } from "./warehouse.updaters";
import { WarehouseItemForm } from "./warehouse.helpers";
import { downloadPdf } from "../../helpers/common-functions.helper";
import { withApiMethods } from "../custome-features/withApiMethods/with-api-methods.feature";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { tap, switchMap } from "rxjs";
import { handleApiResponse } from "../handle-api-response.operator";
import { OverviewCard, OverviewLine, OverViewDay, WarehouseCard, WarehouseItem, WarehouseUnit } from "../../models/warehouses.interface";

export const WarehouseStore = signalStore({
    providedIn: 'root'
},
    withConfirmation(),
    withState(initialWarehouseSlice),
    withLoading(),
    withApiMethods(),
    withProps(_ => {
        const _router = inject(Router);
        const _dialog = inject(Dialog);
        const _toaster = inject(ToasterService);
        const _warehouseService = inject(WarehouseService);
        const slideToIndex = signal<number | null>(null);
        const _signalService = inject(SignalService);
        const warehouseItemModel = signal<WarehouseItemForm>({
            name: ''
        });

        return {
            _router,
            _dialog,
            _toaster,
            _warehouseService,
            slideToIndex,
            _signalService,
            warehouseItemModel
        };
    }),
    withComputed(store => {
        const somethingForDeleting = computed(() => {
            if (!store.cards()) {
                return false;
            }
            return store.cards()?.some(c => c.units?.some(u => u.id > 0));
        });

        const overviewCard = computed(() => {
            if (store.cards().length > 0) {
                let overCard: OverviewCard = { lines: [] };
                store.cards().forEach(card => {
                    let overviewLine: OverviewLine = { days: [] };
                    card.units.forEach(unit => {
                        let day: OverViewDay = { amount: '' };
                        day.amount = unit?.amount !== null ? unit.amount!.toString() : '';
                        overviewLine.days.push(day);
                    });
                    overCard.lines.push(overviewLine)
                });
                return overCard;
            } else {
                return { lines: [] };
            }
        });

        const isSomeUnsavedItems = computed(() => {
            return store.warehouseItems().some(i => i.id <= 0);
        })

        const overviewItems = computed(() => {
            if (store.cards().length > 0) {
                let _items: string[] = [];
                store.cards().forEach(card => {
                    _items.push(card.warehouseItemName);
                });
                return _items;
            } else {
                return [];
            }
        });

        const unitItems = computed(() => {
            if (!store.cards || store.cards().length === 0) {
                return [];
            }
            return store.cards().map(card => {
                return { id: card.warehouseItemId, name: card.warehouseItemName }
            });
        });

        const selectedCard = computed(() => {
            if (!store.cards() || store.cards().length === 0) {
                return null;
            }
            return store.cards()[store.sliceIndex()] ?? null;
        });

        const countOfDays = computed(() => {
            const monthYear = store.monthYear();
            if (!monthYear) {
                return Array(0);
            }
            const year = parseInt(monthYear.substring(2, 6));
            const month = parseInt(monthYear.substring(0, 2));
            return Array(new Date(year, month, 0).getDate());
        });

        const currentCard = computed(() => {
            const group = store.cards();
            if (!group) return null;
            return group[store.sliceIndex()] ?? null;
        });

        return {
            currentCard,
            countOfDays,
            overviewCard,
            overviewItems,
            somethingForDeleting,
            unitItems,
            selectedCard,
            isSomeUnsavedItems
        };

    }),
    withMethods(store => {
        const confirmationStore = inject(ConfirmationStore);

        const getWarehouseCards = rxMethod<void>(input$ => input$.pipe(
            tap(_ => patchState(store, setIsLoading())),
            switchMap(_ => {
                const dest = store.destination();
                const month = store.monthYear();

                if (!dest || !month) {
                    patchState(store, setNotLoading());
                    return [];
                }

                return store._warehouseService.getWarehouseCards(month, dest).pipe(
                    handleApiResponse(store._toaster, {
                        onSuccess: (cards: WarehouseCard[]) => {
                            patchState(store, {
                                cards,
                                sliceIndex: 0,
                                ...closeCalendar()
                            });
                            patchState(store, setNotLoading());
                        },
                        onError: () => patchState(store, setNotLoading())
                    })
                );
            })
        ));

        const createUpdateWarehouseCard = rxMethod<WarehouseCard>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsSaving())),
            switchMap(card => store._warehouseService.createUpdateWarehouseCard(card).pipe(
                handleApiResponse(store._toaster, {
                    successMessage: 'Položka byla aktualizována!',
                    onSuccess: (card) => {
                        patchState(store, updateCards(card));
                        patchState(store, { selectedUnit: null });
                        patchState(store, toggleIsSaving());
                    },
                    onError: () => patchState(store, toggleIsSaving())
                })
            ))
        ));

        const deleteCards = rxMethod<void>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsDeleting())),
            switchMap(_ => store._warehouseService.deleteWarehouseCards(store.monthYear(), store.destination()).pipe(
                handleApiResponse(store._toaster, {
                    successMessage: 'Karty byly smazány!',
                    onSuccess: cards => {
                        patchState(store, { cards: cards });
                        patchState(store, toggleIsDeleting());
                    },
                    onError: () => patchState(store, toggleIsDeleting())
                })
            ))
        ));

        const deleteCard = rxMethod<void>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsDeletingCard())),
            switchMap(_ => store._warehouseService.deleteWarehouseCard(store.selectedCard()?.id || 0).pipe(
                handleApiResponse(store._toaster, {
                    successMessage: 'Karta byly smazána!',
                    onSuccess: cards => {
                        patchState(store, { cards: cards });
                        patchState(store, toggleIsDeletingCard());
                    },
                    onError: () => patchState(store, toggleIsDeleting())
                })
            ))
        ));

        const getWarehouseItems = rxMethod<void>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsLoading())),
            switchMap(_ => store._warehouseService.getAllWarehouseItems().pipe(
                handleApiResponse(store._toaster, {
                    onSuccess: items => {
                        patchState(store, { warehouseItems: items });
                        patchState(store, toggleIsLoading());
                    },
                    onError: () => patchState(store, toggleIsLoading())
                })
            ))
        ));

        const deleteWarehouseItem = rxMethod<WarehouseItem>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsLoading())),
            switchMap(warehouseItem => store._warehouseService.deleteWarehouseItem(warehouseItem.id).pipe(
                handleApiResponse(store._toaster, {
                    successMessage: 'Položka byla smazána',
                    onSuccess: items => {
                        patchState(store, { warehouseItems: items });
                        patchState(store, toggleIsLoading());
                    },
                    onError: () => patchState(store, toggleIsLoading())
                })
            ))
        ));

        const createPdf = rxMethod<void>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsPdfLoading())),
            switchMap(_ => store._warehouseService.createPDF(store.cards()).pipe(
                handleApiResponse(store._toaster, {
                    onSuccess: file => {
                        downloadPdf(file, `Sklad - ${store.cards()[0].monthYearName} - ${store.cards()[0].destination}.pdf`);
                        patchState(store, toggleIsPdfLoading());
                    },
                    onError: () => patchState(store, toggleIsPdfLoading())
                })
            ))
        ));

        const createWarehouseItem = rxMethod<WarehouseItem>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsSaving())),
            switchMap(item => store._warehouseService.createWarehouseItem(item).pipe(
                handleApiResponse(store._toaster, {
                    successMessage: 'Položka byla uložena!',
                    onSuccess: items => {
                        patchState(store, { warehouseItems: items });
                        patchState(store, toggleIsSaving());
                    },
                    onError: () => patchState(store, toggleIsSaving())
                })
            ))
        ));

        const updateWarehouseItem = rxMethod<WarehouseItem>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsSaving())),
            switchMap(newItem => store._warehouseService.updateWarehouseItem(newItem).pipe(
                handleApiResponse(store._toaster, {
                    successMessage: 'Položka byla změněna!',
                    onSuccess: items => {
                        patchState(store, { warehouseItems: items });
                        patchState(store, toggleIsSaving());
                    },
                    onError: () => patchState(store, toggleIsSaving())
                })
            ))
        ));

        const reorderWarehouseItems = rxMethod<WarehouseItem[]>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsLoading())),
            switchMap(items => store._warehouseService.reorderWarehouseItems(items).pipe(
                handleApiResponse(store._toaster, {
                    successMessage: 'Pořadí položek bylo změněno.',
                    onSuccess: items => {
                        patchState(store, { warehouseItems: items });
                        patchState(store, toggleIsLoading());
                    },
                    onError: () => patchState(store, toggleIsLoading())
                })
            ))
        ));

        const removeWarehouseItem = (warehouseItem: WarehouseItem) => {
            let warehouseItems = [...store.warehouseItems()]
            warehouseItems = warehouseItems.filter(i => i.position !== warehouseItem.position);
            patchState(store, { warehouseItems });
        }


        const addNewItem = () => {
            const items = structuredClone(store.warehouseItems());

            const newItem: WarehouseItem = {
                id: -Date.now(),
                name: '',
                position: 1
            };

            const result = [newItem, ...items].map((item, index) => ({
                ...item,
                position: index + 1
            }));

            patchState(store, { warehouseItems: result });
        };

        const slideTo = (index: number) => {
            patchState(store, { sliceIndex: index });
            store.slideToIndex.set(index);
        };

        const consumeSlideToIndex = (): number | null => {
            const index = store.slideToIndex();
            store.slideToIndex.set(null);
            return index;
        };

        const setMonthYear = (monthYear: string) => {
            patchState(store, { monthYear });
            getWarehouseCards();
        }

        const setDestination = (destination: string) => {
            patchState(store, { destination });
            getWarehouseCards();
        }

        confirmationStore.registerHandler(CONFIRM_ACTIONS.DELETE_WAREHOUSE_CARDS, () => {
            deleteCards();
        });

        confirmationStore.registerHandler(CONFIRM_ACTIONS.DELETE_WAREHOUSE_CARD, () => {
            deleteCard();
        });

        confirmationStore.registerHandler(CONFIRM_ACTIONS.DELETE_WAREHOUSE_ITEM, (warehouseItem) => {
            deleteWarehouseItem(warehouseItem as WarehouseItem);
        });

        return {
            setDestination: (destination: string) => setDestination(destination),
            setCards: (cards: WarehouseCard[]) => patchState(store, { cards }),
            setMonthYear: (monthYear: string) => setMonthYear(monthYear),
            resetMonthYaer: () => setMonthYear(MONTHS_NUM[new Date().getMonth()] + new Date().getFullYear()),
            getWarehouseCards: () => getWarehouseCards(),
            setSlideIndex: (sliceIndex: number) => patchState(store, { sliceIndex }),
            toggleCalendar: () => patchState(store, toggleCalendar()),
            closeCalendar: () => patchState(store, closeCalendar()),
            setWarehouseNave: (warehouseNav: 'units' | 'board' | 'items') => patchState(store, { warehouseNav }),
            slideTo,
            consumeSlideToIndex,
            removeWarehouseItem: (warehouseItem: WarehouseItem) => removeWarehouseItem(warehouseItem),
            reorderWarehouseItems: (items: WarehouseItem[]) => reorderWarehouseItems(items),
            createPdf: () => createPdf(),
            createWarehouseItem: (newItem: WarehouseItem) => createWarehouseItem(newItem),
            updateWarehouseItem: (newItem: WarehouseItem) => updateWarehouseItem(newItem),
            createUpdateWarehouseCard: (card: WarehouseCard) => createUpdateWarehouseCard(card),
            setSelectedUnit: (selectedUnit: WarehouseUnit) => patchState(store, { selectedUnit }),
            getWarehouseItems: () => getWarehouseItems(),
            addNewItem: () => addNewItem(),
            requestDeleteCards: () => {
                confirmationStore.openConfirmation(
                    CONFIRM_ACTIONS.DELETE_WAREHOUSE_CARDS,
                    `Opravdu smazat karty za ${store.cards()[0].monthYearName.toLowerCase()}?`
                );
            },
            requestDeleteCard: () => {
                confirmationStore.openConfirmation(
                    CONFIRM_ACTIONS.DELETE_WAREHOUSE_CARD,
                    `Opravdu smazat kartu za ${store.selectedCard()?.monthYearName.toLowerCase()}?`
                );
            },
            requestDeleteWarehouseItem: (warehouseItem: WarehouseItem) => {
                confirmationStore.openConfirmation(
                    CONFIRM_ACTIONS.DELETE_WAREHOUSE_ITEM,
                    `Opravdu smazat položku ${warehouseItem.name}?`,
                    warehouseItem
                );
            }
        }
    }),
)