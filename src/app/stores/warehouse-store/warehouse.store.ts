import { patchState, signalStore, withComputed, withMethods, withProps, withState } from "@ngrx/signals";
import { computed, inject, signal } from "@angular/core";
import { Dialog } from '@angular/cdk/dialog';
import { ToasterService } from "../../services/toaster.service";
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap, tap } from "rxjs";
import { tapResponse } from '@ngrx/operators';
import { withLoading } from "../custome-features/withLoading/with-loading.feature";
import { closeCalendar, setIsLoading, toggleIsSaving, togglePdfButtonLoading, setNotLoading, toggleCalendar, toggleIsPdfLoading, toggleIsDeleting } from "../custome-features/withLoading/with-loading.updaters";
import { withConfirmation } from "../custome-features/withConfirmation/with-confirmation.feature";
import { ConfirmationStore } from "../custome-features/withConfirmation/confirmation.store";

//import { setSelectedCardPosition, setSlideIndexAndPosition, updateAfterDeleteCard, setSelectedShift, updateCard } from "./shifts.updaters";
import { convertMonthYear, setTime } from '../../helpers/common-functions.helper';
import { CONFIRM_ACTIONS } from "../custome-features/withConfirmation/confirmation.actions";

import { MONTHS, MONTHS_NUM } from "../../helpers/common-constants.helper";
import { initialWarehouseSlice } from "./warehouse.slice";
import { WarehouseService } from "../../services/warehouse.service";
import { SignalService } from "../../services/signal.service";
import { OverviewCard, OverViewDay, OverviewLine, WarehouseCard } from "../../models/warehouse/warehouse-card.interface";
import { Router } from "@angular/router";

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


        return {
            _router,
            _dialog,
            _toaster,
            _warehouseService,
            slideToIndex,
            _signalService
        };
    }),
    withComputed(store => {
        const warehouseNav = computed(() => {
            console.log(store._router.lastSuccessfulNavigation());

            if (store._router.isActive('/warehouse', false)) {
                console.log('warehouse');

            }
            if (store._router.isActive('/warehouse/warehouse-units', false)) {
                console.log('warehouse-units');

            }
            return store._router.url;
        });
        // const uniqueUsers = computed(() => {
        //     const cards = store.cards() ?? [];
        //     const unique: UniqueUser[] = [];
        //     for (const card of cards) {
        //         const i = unique.findIndex(u => u.userId === card.userId);
        //         if (i >= 0) {
        //             unique[i].cards.push(card);
        //         } else {
        //             unique.push({
        //                 userId: card.userId,
        //                 userName: card.userName,
        //                 userSurname: card.userSurname,
        //                 cards: [card],
        //             });
        //         }
        //     }
        //     return unique;
        // });

        // const currentGroup = computed(() => {
        //     const groups = uniqueUsers();
        //     const idx = store.sliceIndex() ?? 0;
        //     return groups[idx] ?? null;
        // });

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

            // const pos = store.selectedCardPosition();
            // if (pos) {
            //     return group.find(c => c.userPosition === pos) ?? null;
            // }
            return group[store.sliceIndex()] ?? null;
        });

        // const initialShift = computed(() => {
        //     const card = currentCard();
        //     if (!card) return store.selectedShift();

        //     return {
        //         id: 0,
        //         shiftCardId: card.id,
        //         userId: card.userId,
        //         position: card.userPosition,
        //         destination: card.destination,
        //         date: '',
        //         from: '11:00',
        //         to: '22:00',
        //         hours: '',
        //         perso: '',
        //         createdAt: null,
        //         createdBy: null,
        //         updatedAt: null,
        //         updatedBy: null
        //     };
        // });

        // const currentPositions = computed(() => currentGroup()?.cards.map(c => c.userPosition) ?? []);
        // const currentTotalHours = computed(() => {
        //     let total = null;
        //     let hours = 0;
        //     let minutes = 0;
        //     if (currentGroup() && currentGroup().cards.length > 1) {
        //         currentGroup().cards.forEach(card => {
        //             if (card.totalHours) {
        //                 hours += parseInt(card.totalHours.split(":")[0]);
        //                 minutes += parseInt(card.totalHours.split(":")[1]);
        //                 if (minutes >= 60) {
        //                     hours += 1;
        //                     minutes = minutes - 60;
        //                 }
        //             }
        //         });

        //         if (hours > 0 && minutes > 0) {
        //             const _hours = hours < 10 ? `0${hours.toString()}` : `${hours.toString()}`;
        //             const _minutes = minutes < 10 ? `0${minutes.toString()}` : `${minutes.toString()}`;
        //             total = `${_hours}:${_minutes}`;
        //         }
        //     }
        //     return total;
        // })
        // const userCards = computed(() => currentGroup()?.cards ?? []);
        // const pdfCards = computed(() => (store.cards() ?? []).filter(card => card.id > 0 && card.shifts.length > 0));

        // const isPastCard = computed(() => {
        //     const currentDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        //     const cardDate = new Date(
        //         parseInt(store.monthYear().substring(2, 6), 10),
        //         parseInt(store.monthYear().substring(0, 2), 10) - 1,
        //         1
        //     );
        //     return cardDate < currentDate;
        // });

        // const missingCardsMessage = computed(() => {
        //     if (isPastCard()) {
        //         return `Směny pro ${MONTHS[parseInt(store.monthYear().substring(0, 2)) - 1].toLowerCase()} ${store.monthYear().substring(2, 6)} nejsou uloženy.`;
        //     } else {
        //         return `Chybí uživatelé na pobočce - ${store.destination()}.`;
        //     }
        // });

        return {
            // uniqueUsers,
            // isPastCard,
            // missingCardsMessage,
            // pdfCards,
            currentCard,
            countOfDays,
            overviewCard,
            overviewItems,
            warehouseNav
            // userCards,
            // currentPositions,
            // initialShift,
            // currentTotalHours
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
                                // patchState(store, { selectedCardPosition: store.cards()[0].userPosition });
                            } else {
                                patchState(store, { cards: [] });
                                patchState(store, { sliceIndex: 0 });
                                // patchState(store, { selectedCardPosition: '' });
                            }
                            patchState(store, closeCalendar());
                        }
                    },
                    error: () => patchState(store, setNotLoading())
                })
            ))
        ));

        // const onAllToPdf = rxMethod<void>(input$ => input$.pipe(
        //     tap(_ => patchState(store, toggleIsPdfLoading())),
        //     switchMap(_ => store._shiftService.generateAllToPDF(store.pdfCards()).pipe(
        //         tapResponse({
        //             next: response => {
        //                 patchState(store, toggleIsPdfLoading());
        //                 if (response === null) {
        //                     store._toaster.error('Něco se pokazilo, zkus to znovu.');
        //                 } else if (response.isSuccess === false) {
        //                     store._toaster.error(response.errorMessage);
        //                 } else {
        //                     const binary = atob(response.result);
        //                     const uint8Array = new Uint8Array(binary.length);
        //                     for (let i = 0; i < binary.length; i++) {
        //                         uint8Array[i] = binary.charCodeAt(i);
        //                     }
        //                     const blob = new Blob([uint8Array], { type: 'application/pdf' });
        //                     var url = window.URL.createObjectURL(blob);
        //                     const a = document.createElement('a')
        //                     a.href = url;
        //                     a.download = `${MONTHS[parseInt(store.monthYear().substring(0, 2)) - 1]} ${store.monthYear().substring(2, 6)} - ${store.destination()}.pdf`;
        //                     a.click();
        //                     URL.revokeObjectURL(url);
        //                 }
        //             },
        //             error: () => patchState(store, toggleIsPdfLoading())
        //         })
        //     ))
        // ));

        // const toPdfCard = rxMethod<void>(input$ => input$.pipe(
        //     tap(_ => patchState(store, togglePdfButtonLoading())),
        //     switchMap(_ => {
        //         const card = store.currentCard();
        //         if (!card) {
        //             patchState(store, togglePdfButtonLoading());
        //             store._toaster.error('Žádná karta není vybrána.');
        //             return [];
        //         }
        //         return store._shiftService.generatePDF(card).pipe(
        //             tapResponse({
        //                 next: response => {
        //                     patchState(store, togglePdfButtonLoading());
        //                     if (response === null) {
        //                         store._toaster.error('Něco se pokazilo, zkus to znovu.');
        //                     } else if (response.isSuccess === false) {
        //                         store._toaster.error(response.errorMessage);
        //                     } else {
        //                         const binary = atob(response.result);
        //                         const uint8Array = new Uint8Array(binary.length);
        //                         for (let i = 0; i < binary.length; i++) {
        //                             uint8Array[i] = binary.charCodeAt(i);
        //                         }
        //                         const blob = new Blob([uint8Array], { type: 'application/pdf' });
        //                         var url = window.URL.createObjectURL(blob);
        //                         const a = document.createElement('a')
        //                         a.href = url;
        //                         a.download = `${store.currentCard()!.userName} ${store.currentCard()!.userSurname} - ${convertMonthYear(store.currentCard()!.monthYear)} - ${store.currentCard()!.destination}.pdf`;
        //                         a.click();
        //                         URL.revokeObjectURL(url);
        //                     }
        //                 },
        //                 error: () => patchState(store, togglePdfButtonLoading())
        //             })
        //         );
        //     })
        // ));

        // const deleteCard = rxMethod<void>(input$ => input$.pipe(
        //     tap(_ => patchState(store, toggleIsDeleting())),
        //     switchMap(_ => store._shiftService.deleteShiftCard(store.currentCard()!.id).pipe(
        //         tapResponse({
        //             next: response => {
        //                 patchState(store, toggleIsDeleting());
        //                 if (response === null) {
        //                     store._toaster.error('Něco se pokazilo, zkus to znovu.');
        //                 } else if (response.isSuccess === false) {
        //                     store._toaster.error(response.errorMessage);
        //                 } else {
        //                     patchState(store, updateAfterDeleteCard(store.currentCard()!.id, response.result));
        //                     store._toaster.success('Karta byla smazána!');
        //                 }
        //             },
        //             error: () => patchState(store, toggleIsDeleting())
        //         })
        //     ))
        // ));

        // const createUpdateShift = rxMethod<void>(input$ => input$.pipe(
        //     tap(_ => patchState(store, toggleIsSaving())),
        //     switchMap(_ => store._shiftService.createUpdateShift(store.selectedShift()).pipe(
        //         tapResponse({
        //             next: response => {
        //                 patchState(store, toggleIsSaving())
        //                 if (response === null) {
        //                     store._toaster.error('Něco se pokazilo, zkus to znovu.');
        //                 } else if (response.isSuccess === false) {
        //                     store._toaster.error(response.errorMessage);
        //                 } else {
        //                     patchState(store, updateCard(response.result));
        //                     store._toaster.success('Směna byla uložena!');
        //                     store._dialog.closeAll();
        //                 }
        //             },
        //             error: () => patchState(store, toggleIsSaving())
        //         })
        //     ))
        // ));

        // const deleteShift = rxMethod<void>(input$ => input$.pipe(
        //     tap(_ => patchState(store, toggleIsDeleting())),
        //     switchMap(_ => store._shiftService.deleteShift(store.selectedShift().id).pipe(
        //         tapResponse({
        //             next: response => {
        //                 patchState(store, toggleIsDeleting())
        //                 if (response === null) {
        //                     store._toaster.error('Něco se pokazilo, zkus to znovu.');
        //                 } else if (response.isSuccess === false) {
        //                     store._toaster.error(response.errorMessage);
        //                 } else {
        //                     patchState(store, updateCard(response.result));
        //                     store._toaster.success('Směna byla smazána!');
        //                     store._dialog.closeAll();
        //                 }
        //             },
        //             error: () => patchState(store, toggleIsDeleting())
        //         })
        //     ))
        // ));

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

        // confirmationStore.registerHandler(CONFIRM_ACTIONS.DELETE_SHIFT_CARD, () => {
        //     deleteCard();
        // });

        // confirmationStore.registerHandler(CONFIRM_ACTIONS.DELETE_SHIFT, () => {
        //     deleteShift();
        // });

        return {
            setDestination: (destination: string) => setDestination(destination),
            setCards: (cards: WarehouseCard[]) => patchState(store, { cards }),
            setMonthYear: (monthYear: string) => setMonthYear(monthYear),
            resetMonthYaer: () => setMonthYear(MONTHS_NUM[new Date().getMonth()] + new Date().getFullYear()),
            setSelectedCard: (card: WarehouseCard | null) => patchState(store, { selectedCard: card }),
            getWarehouseCards: () => getWarehouseCards(),
            setSlideIndex: (sliceIndex: number) => patchState(store, { sliceIndex }),
            toggleCalendar: () => patchState(store, toggleCalendar()),
            closeCalendar: () => patchState(store, closeCalendar()),
            // allToPdf: () => onAllToPdf(),
            slideTo,
            consumeSlideToIndex,
            // toPdfCard: () => toPdfCard(),
            // setSelectedCardPosition: (position: string) => patchState(store, setSelectedCardPosition(position)),
            // requestDeleteCard: () => {
            //     confirmationStore.openConfirmation(
            //         CONFIRM_ACTIONS.DELETE_SHIFT_CARD,
            //         'Opravdu chceš smazat kartu?'
            //     );
            // },
            // requestDeleteShift: () => {
            //     confirmationStore.openConfirmation(
            //         CONFIRM_ACTIONS.DELETE_SHIFT,
            //         'Opravdu chceš smazat směnu?'
            //     );
            // },
            // addShift: () => {
            //     const initial = store.initialShift();
            //     patchState(store, setSelectedShift(initial, store.isPastCard(), store.monthYear()));
            //     store.shiftModel.set({
            //         date: initial.date,
            //         from: setTime('11:00', initial.date),
            //         to: setTime(store.selectedShift().to!, initial.date),
            //         perso: ''
            //     });
            //     patchState(store, { isAddShiftDialogRequested: true });
            // },
            // clearAddShiftDialogRequest: () => {
            //     patchState(store, { isAddShiftDialogRequested: false });
            // },
            // createUpdateShift: () => { createUpdateShift() },
            // updateShift: (shift: Shift) => {
            //     patchState(store, setSelectedShift(shift, store.isPastCard(), store.monthYear()));
            //     store.shiftModel.set({
            //         date: shift.date,
            //         from: setTime(shift.from!, shift.date),
            //         to: setTime(shift.to!, shift.date),
            //         perso: shift.perso ? shift.perso : ''
            //     });
            //     patchState(store, { isAddShiftDialogRequested: true });
            // },
        }
    }),
)

