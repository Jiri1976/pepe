import { patchState, signalStore, withComputed, withMethods, withProps, withState } from "@ngrx/signals";
import { computed, inject, signal } from "@angular/core";
import { Dialog } from '@angular/cdk/dialog';
import { ToasterService } from "../../services/toaster.service";
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap, tap } from "rxjs";
import { tapResponse } from '@ngrx/operators';
import { withLoading } from "../custome-features/withLoading/with-loading.feature";
import { closeCalendar, setIsLoading, toggleIsSaving, togglePdfButtonLoading, setNotLoading, toggleCalendar, toggleIsPdfLoading, toggleIsDeleting, toggleIsDeletingCard, toggleIsLoading } from "../custome-features/withLoading/with-loading.updaters";
import { withConfirmation } from "../custome-features/withConfirmation/with-confirmation.feature";
import { ConfirmationStore } from "../custome-features/withConfirmation/confirmation.store";
import { CONFIRM_ACTIONS } from "../custome-features/withConfirmation/confirmation.actions";
import { MONTHS_NUM } from "../../helpers/common-constants.helper";
import { initialWarehouseSlice } from "./warehouse.slice";
import { WarehouseService } from "../../services/warehouse.service";
import { SignalService } from "../../services/signal.service";
import { OverviewCard, OverViewDay, OverviewLine, WarehouseCard } from "../../models/warehouse/warehouse-card.interface";
import { Router } from "@angular/router";
import { updateCards } from "./warehouse.updaters";
import { WarehouseUnit } from "../../models/warehouse/warehouse-unit.interface";
import { WarehouseItem } from "../../models/warehouse/warehouse-item.interface";
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { WarehouseItemForm } from "./warehouse.helpers";

export const WarehouseStore = signalStore({
    providedIn: 'root'
},
    withConfirmation(),
    withState(initialWarehouseSlice),
    withLoading(),
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
            switchMap(_ => store._warehouseService.getWarehouseCards(store.monthYear(), store.destination()).pipe(
                tapResponse({
                    next: response => {
                        patchState(store, setNotLoading());
                        if (response === null) {
                            store._toaster.error('Něco se pokazilo, zkus to znovu.');
                        } else if (response.isSuccess === false) {
                            store._toaster.error(response.errorMessage);
                        } else {
                            //store._signalService.sendCards(store.destination(), this.warehouseService.isUpdating(), false);
                            if (response.result.length > 0) {
                                patchState(store, { cards: response.result });
                                patchState(store, { sliceIndex: 0 });
                            } else {
                                patchState(store, { cards: [] });
                                patchState(store, { sliceIndex: 0 });
                            }
                            patchState(store, closeCalendar());
                        }
                    },
                    error: () => patchState(store, setNotLoading())
                })
            ))
        ));

        const createUpdateWarehouseCard = rxMethod<WarehouseCard>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsSaving())),
            switchMap(card => store._warehouseService.createUpdateWarehouseCard(card).pipe(
                tapResponse({
                    next: response => {
                        patchState(store, toggleIsSaving());
                        if (response === null) {
                            store._toaster.error('Něco se pokazilo, zkus to znovu.');
                        } else if (response.isSuccess === false) {
                            store._toaster.error(response.errorMessage);
                        } else {
                            //this.signalService.sendCards(this.destination(), true, false);
                            store._toaster.success('Položka byla aktualizována!')
                            patchState(store, updateCards(response.result));
                            patchState(store, { selectedUnit: null })
                        }
                    },
                    error: () => patchState(store, toggleIsSaving())
                })
            ))
        ));

        const deleteCards = rxMethod<void>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsDeleting())),
            switchMap(_ => store._warehouseService.deleteWarehouseCards(store.monthYear(), store.destination()).pipe(
                tapResponse({
                    next: response => {
                        patchState(store, toggleIsDeleting())
                        if (response === null) {
                            store._toaster.error('Něco se pokazilo, zkus to znovu.');
                        } else if (response.isSuccess === false) {
                            store._toaster.error(response.errorMessage);
                        } else {
                            store._toaster.success('Karty byly smazány!');
                            patchState(store, { cards: response.result });
                        }
                    },
                    error: () => patchState(store, toggleIsDeleting())
                })
            ))
        ));

        const deleteCard = rxMethod<number>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsDeletingCard())),
            switchMap(_ => store._warehouseService.deleteWarehouseCard(store.selectedCard()!.id).pipe(
                tapResponse({
                    next: response => {
                        patchState(store, toggleIsDeletingCard())
                        if (response === null) {
                            store._toaster.error('Něco se pokazilo, zkus to znovu.');
                        } else if (response.isSuccess === false) {
                            store._toaster.error(response.errorMessage);
                        } else {
                            store._toaster.success('Karty byly smazány!');
                            patchState(store, { cards: response.result });
                        }
                    },
                    error: () => patchState(store, toggleIsDeletingCard())
                })
            ))
        ));

        const getWarehouseItems = rxMethod<void>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsLoading())),
            switchMap(_ => store._warehouseService.getAllWarehouseItems().pipe(
                tapResponse({
                    next: response => {
                        patchState(store, toggleIsLoading());
                        if (response === null) {
                            store._toaster.error('Něco se pokazilo, zkus to znovu.');
                        } else if (response.isSuccess === false) {
                            store._toaster.error(response.errorMessage);
                        } else {
                            patchState(store, { warehouseItems: response.result });
                        }
                    },
                    error: () => patchState(store, toggleIsLoading())
                })
            ))
        ));

        const deleteWarehouseItem = rxMethod<WarehouseItem>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsLoading())),
            switchMap(warehouseItem => store._warehouseService.deleteWarehouseItem(warehouseItem.id).pipe(
                tapResponse({
                    next: response => {
                        patchState(store, toggleIsLoading());
                        if (response === null) {
                            store._toaster.error('Něco se pokazilo, zkus to znovu.');
                        } else if (response.isSuccess === false) {
                            store._toaster.error(response.errorMessage);
                        } else {
                            store._toaster.success("Položka byla smazána");
                            patchState(store, { warehouseItems: response.result });
                        }
                    },
                    error: () => patchState(store, toggleIsLoading())
                })
            ))
        ));

        const createPdf = rxMethod<void>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsPdfLoading())),
            switchMap(_ => store._warehouseService.createPDF(store.cards()).pipe(
                tapResponse({
                    next: response => {
                        patchState(store, toggleIsPdfLoading());
                        if (response === null) {
                            store._toaster.error('Něco se pokazilo, zkus to znovu.');
                        } else if (response.isSuccess === false) {
                            store._toaster.error(response.errorMessage);
                        } else {
                            const binary = atob(response.result);
                            const uint8Array = new Uint8Array(binary.length);
                            for (let i = 0; i < binary.length; i++) {
                                uint8Array[i] = binary.charCodeAt(i);
                            }
                            const blob = new Blob([uint8Array], { type: 'application/pdf' });
                            var url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a')
                            a.href = url;
                            a.download = `Sklad - ${store.cards()[0].monthYearName} - ${store.cards()[0].destination}.pdf`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }
                    },
                    error: () => patchState(store, toggleIsPdfLoading())
                })
            ))
        ));

        const createWarehouseItem = rxMethod<WarehouseItem>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsSaving())),
            switchMap(newItem => store._warehouseService.createWarehouseItem(newItem).pipe(
                tapResponse({
                    next: response => {
                        patchState(store, toggleIsSaving());
                        if (response === null) {
                            store._toaster.error('Něco se pokazilo, zkus to znovu.');
                        } else if (response.isSuccess === false) {
                            store._toaster.error(response.errorMessage);
                        } else {
                            //  this.signalServie.sendCards('F-M', false, true); 
                            patchState(store, { warehouseItems: response.result });
                            store._toaster.success('Položka byla uložena!');
                        }
                    },
                    error: () => patchState(store, toggleIsSaving())
                })
            ))
        ));

        const updateWarehouseItem = rxMethod<WarehouseItem>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsSaving())),
            switchMap(newItem => store._warehouseService.updateWarehouseItem(newItem).pipe(
                tapResponse({
                    next: response => {
                        patchState(store, toggleIsSaving());
                        if (response === null) {
                            store._toaster.error('Něco se pokazilo, zkus to znovu.');
                        } else if (response.isSuccess === false) {
                            store._toaster.error(response.errorMessage);
                        } else {
                            //  this.signalServie.sendCards('F-M', false, true); 
                            patchState(store, { warehouseItems: response.result });
                            store._toaster.success('Položka byla změněna!');
                        }
                    },
                    error: () => patchState(store, toggleIsSaving())
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
                // id: 0,
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

        const reorderWarehouseItems = rxMethod<WarehouseItem[]>(input$ =>
            input$.pipe(
                tap(() => patchState(store, toggleIsLoading())),
                switchMap(items =>
                    store._warehouseService.reorderWarehouseItems(items).pipe(
                        tapResponse({
                            next: response => {
                                patchState(store, toggleIsLoading());

                                if (!response || response.isSuccess === false) {
                                    store._toaster.error(response?.errorMessage ?? 'Něco se pokazilo.');
                                    return;
                                }

                                patchState(store, { warehouseItems: response.result });
                                //store._signalService.sendCards('F-M', false, true);
                                store._toaster.success('Pořadí položek bylo změněno.');
                            },
                            error: () => patchState(store, toggleIsLoading())
                        })
                    )
                )
            )
        );

        confirmationStore.registerHandler(CONFIRM_ACTIONS.DELETE_WAREHOUSE_CARDS, () => {
            deleteCards();
        });

        confirmationStore.registerHandler(CONFIRM_ACTIONS.DELETE_WAREHOUSE_CARD, () => {
            deleteCard(store.selectedCard()?.id || 0);
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
            requestDeleteCards: () => {
                confirmationStore.openConfirmation(
                    CONFIRM_ACTIONS.DELETE_WAREHOUSE_CARDS,
                    `Opravdu smazat karty za ${store.cards()[0].monthYearName.toLowerCase()}?`
                );
            },
            createUpdateWarehouseCard: (card: WarehouseCard) => createUpdateWarehouseCard(card),
            requestDeleteCard: () => {
                confirmationStore.openConfirmation(
                    CONFIRM_ACTIONS.DELETE_WAREHOUSE_CARD,
                    `Opravdu smazat kartu za ${store.selectedCard()?.monthYearName.toLowerCase()}?`
                );
            },
            setSelectedUnit: (selectedUnit: WarehouseUnit) => patchState(store, { selectedUnit }),
            getWarehouseItems: () => getWarehouseItems(),
            addNewItem: () => addNewItem(),
            requestDeleteWarehouseItem: (warehouseItem: WarehouseItem) => {
                confirmationStore.openConfirmation(
                    CONFIRM_ACTIONS.DELETE_WAREHOUSE_ITEM,
                    `Opravdu smazat položku ${warehouseItem.name}?`,
                    warehouseItem
                );
            },
            removeWarehouseItem: (warehouseItem: WarehouseItem) => removeWarehouseItem(warehouseItem),
            reorderWarehouseItems: (items: WarehouseItem[]) => reorderWarehouseItems(items),
            createPdf: () => createPdf(),
            createWarehouseItem: (newItem: WarehouseItem) => createWarehouseItem(newItem),
            updateWarehouseItem: (newItem: WarehouseItem) => updateWarehouseItem(newItem)
        }
    }),
)

