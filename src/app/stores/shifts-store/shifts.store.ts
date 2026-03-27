import { patchState, signalStore, withComputed, withMethods, withProps, withState } from "@ngrx/signals";
import { computed, inject, signal } from "@angular/core";
import { Dialog } from '@angular/cdk/dialog';
import { ToasterService } from "../../services/toaster.service";
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap, tap } from "rxjs";
import { withLoading } from "../custome-features/withLoading/with-loading.feature";
import { closeCalendar, setIsLoading, toggleIsSaving, togglePdfButtonLoading, setNotLoading, toggleCalendar, toggleIsPdfLoading, toggleIsDeleting } from "../custome-features/withLoading/with-loading.updaters";
import { withConfirmation } from "../custome-features/withConfirmation/with-confirmation.feature";
import { ConfirmationStore } from "../custome-features/withConfirmation/confirmation.store";
import { initialShiftsSlice } from "./shifts.slice";
import { ShiftService } from "../../services/shift.service";
import { setSelectedCardPosition, setSlideIndexAndPosition, updateAfterDeleteCard, setSelectedShift, updateCard } from "./shifts.updaters";
import { convertMonthYear, downloadPdf, initializeMonthYear, setTime } from '../../helpers/common-functions.helper';
import { CONFIRM_ACTIONS } from "../custome-features/withConfirmation/confirmation.actions";
import { Shift, ShiftCard, ShiftModel, UniqueUser } from "../../models/shifts.interface";
import { MONTHS } from "../../helpers/common-constants.helper";
import { handleApiResponse } from "../handle-api-response.operator";
import { AuthStore } from "../auth-store/auth.store";

export const ShiftsStore = signalStore({
    providedIn: 'root'
},
    withConfirmation(),
    withState(initialShiftsSlice),
    withLoading(),
    withProps(_ => {
        const _dialog = inject(Dialog);
        const _toaster = inject(ToasterService);
        const _shiftService = inject(ShiftService);
        const slideToIndex = signal<number | null>(null);
        const shiftModel = signal<ShiftModel>({
            date: '',
            from: setTime('11:00', '03.02.2026'),
            to: setTime('22:00', '03.02.2026'),
            perso: '',
        });
        const _auth = inject(AuthStore);

        return {
            _dialog,
            _toaster,
            _shiftService,
            slideToIndex,
            shiftModel,
            _auth
        };
    }),
    withComputed(store => {
        const uniqueUsers = computed(() => {
            const cards = store.cards() ?? [];
            const unique: UniqueUser[] = [];
            for (const card of cards) {
                const i = unique.findIndex(u => u.userId === card.userId);
                if (i >= 0) {
                    unique[i].cards.push(card);
                } else {
                    unique.push({
                        userId: card.userId,
                        userName: card.userName,
                        userSurname: card.userSurname,
                        cards: [card],
                    });
                }
            }
            return unique;
        });

        const currentGroup = computed(() => {
            const groups = uniqueUsers();
            const idx = store.sliceIndex() ?? 0;
            return groups[idx] ?? null;
        });

        const currentCard = computed(() => {
            const group = currentGroup();
            if (!group) return null;

            const pos = store.selectedCardPosition();
            if (pos) {
                return group.cards.find(c => c.userPosition === pos) ?? null;
            }
            return group.cards[0] ?? null;
        });

        const initialShift = computed(() => {
            const card = currentCard();
            if (!card) return store.selectedShift();

            return {
                id: 0,
                shiftCardId: card.id,
                userId: card.userId,
                position: card.userPosition,
                destination: card.destination,
                date: '',
                from: '11:00',
                to: '22:00',
                hours: '',
                perso: '',
                createdAt: null,
                createdBy: null,
                updatedAt: null,
                updatedBy: null
            };
        });

        const currentPositions = computed(() => currentGroup()?.cards.map(c => c.userPosition) ?? []);
        const currentTotalHours = computed(() => {
            let total = null;
            let hours = 0;
            let minutes = 0;
            if (currentGroup() && currentGroup().cards.length > 1) {
                currentGroup().cards.forEach(card => {
                    if (card.totalHours) {
                        hours += parseInt(card.totalHours.split(":")[0]);
                        minutes += parseInt(card.totalHours.split(":")[1]);
                        if (minutes >= 60) {
                            hours += 1;
                            minutes = minutes - 60;
                        }
                    }
                });

                if (hours > 0 && minutes > 0) {
                    const _hours = hours < 10 ? `0${hours.toString()}` : `${hours.toString()}`;
                    const _minutes = minutes < 10 ? `0${minutes.toString()}` : `${minutes.toString()}`;
                    total = `${_hours}:${_minutes}`;
                }
            }
            return total;
        })
        const userCards = computed(() => currentGroup()?.cards ?? []);
        const pdfCards = computed(() => (store.cards() ?? []).filter(card => card.id > 0 && card.shifts.length > 0));

        const isPastCard = computed(() => {
            const currentDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            const cardDate = new Date(
                parseInt(store.monthYear().substring(2, 6), 10),
                parseInt(store.monthYear().substring(0, 2), 10) - 1,
                1
            );
            return cardDate < currentDate;
        });

        const missingCardsMessage = computed(() => {
            if (isPastCard()) {
                return `Směny pro ${MONTHS[parseInt(store.monthYear().substring(0, 2)) - 1].toLowerCase()} ${store.monthYear().substring(2, 6)} nejsou uloženy.`;
            } else {
                return `Chybí uživatelé na pobočce - ${store.destination()}.`;
            }
        });

        return {
            uniqueUsers,
            isPastCard,
            missingCardsMessage,
            pdfCards,
            currentCard,
            userCards,
            currentPositions,
            initialShift,
            currentTotalHours
        };

    }),
    withMethods(store => {
        const confirmationStore = inject(ConfirmationStore);

        const getCards = rxMethod<void>(input$ => input$.pipe(
            tap(_ => patchState(store, setIsLoading())),
            switchMap(_ => {
                if (store._auth.user()?.role !== 'Admin') {
                    patchState(store, { destination: store._auth.user()?.destination })
                };
                const dest = store.destination();
                const month = store.monthYear();
                if (!dest) {
                    patchState(store, setNotLoading()); // prevent loader stuck
                    return [];
                }

                return store._shiftService.getUsersShiftCards(month, dest).pipe(
                    handleApiResponse(store._toaster, {
                        onSuccess: (cards) => {
                            patchState(store, setNotLoading());
                            if (cards.length > 0) {
                                patchState(store, { cards, sliceIndex: 0, selectedCardPosition: cards[0].userPosition });
                            } else {
                                patchState(store, { cards: [], sliceIndex: 0, selectedCardPosition: '' });
                            }
                            patchState(store, closeCalendar());
                        },
                        onError: () => patchState(store, setNotLoading())
                    })
                );
            })
        ));

        const onAllToPdf = rxMethod<void>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsPdfLoading())),
            switchMap(_ => store._shiftService.generateAllToPDF(store.pdfCards()).pipe(
                handleApiResponse(store._toaster, {
                    onSuccess: (file) => {
                        patchState(store, toggleIsPdfLoading());
                        downloadPdf(file, `${MONTHS[parseInt(store.monthYear().substring(0, 2)) - 1]} ${store.monthYear().substring(2, 6)} - ${store.destination()}.pdf`);
                    },
                    onError: () => patchState(store, toggleIsPdfLoading())
                })
            ))
        ));

        const toPdfCard = rxMethod<void>(input$ => input$.pipe(
            tap(_ => patchState(store, togglePdfButtonLoading())),
            switchMap(_ => {
                const card = store.currentCard();
                if (!card) {
                    patchState(store, togglePdfButtonLoading());
                    store._toaster.error('Žádná karta není vybrána.');
                    return [];
                }
                return store._shiftService.generatePDF(card).pipe(
                    handleApiResponse(store._toaster, {
                        onSuccess: (file) => {
                            patchState(store, togglePdfButtonLoading());
                            downloadPdf(file, `${store.currentCard()!.userName} ${store.currentCard()!.userSurname} - ${convertMonthYear(store.currentCard()!.monthYear)} - ${store.currentCard()!.destination}.pdf`);
                        },
                        onError: () => patchState(store, togglePdfButtonLoading())
                    })
                );
            })
        ));

        const deleteCard = rxMethod<void>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsDeleting())),
            switchMap(_ => store._shiftService.deleteShiftCard(store.currentCard()!.id).pipe(
                handleApiResponse(store._toaster, {
                    successMessage: 'Karta byla smazána!',
                    onSuccess: (card) => {
                        patchState(store, toggleIsDeleting());
                        patchState(store, updateAfterDeleteCard(store.currentCard()!.id, card));
                    },
                    onError: () => patchState(store, toggleIsDeleting())
                })
            ))
        ));

        const createUpdateShift = rxMethod<void>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsSaving())),
            switchMap(_ => store._shiftService.createUpdateShift(store.selectedShift()).pipe(
                handleApiResponse(store._toaster, {
                    successMessage: 'Směna byla uložena!',
                    onSuccess: (card) => {
                        patchState(store, toggleIsSaving());
                        patchState(store, updateCard(card));
                        store._dialog.closeAll();
                    },
                    onError: () => patchState(store, toggleIsSaving())
                })
            ))
        ));

        const deleteShift = rxMethod<void>(input$ => input$.pipe(
            tap(_ => patchState(store, toggleIsDeleting())),
            switchMap(_ => store._shiftService.deleteShift(store.selectedShift().id).pipe(
                handleApiResponse(store._toaster, {
                    successMessage: 'Směna byla smazána!',
                    onSuccess: (card) => {
                        patchState(store, toggleIsDeleting());
                        patchState(store, updateCard(card));
                        store._dialog.closeAll();
                    },
                    onError: () => patchState(store, toggleIsDeleting())
                })
            ))
        ));

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
            getCards();
        }

        const setDestination = (destination: string) => {
            patchState(store, { destination });
            getCards();
        }

        confirmationStore.registerHandler(CONFIRM_ACTIONS.DELETE_SHIFT_CARD, () => {
            deleteCard();
        });

        confirmationStore.registerHandler(CONFIRM_ACTIONS.DELETE_SHIFT, () => {
            deleteShift();
        });

        return {
            setDestination: (destination: string) => setDestination(destination),
            setCards: (cards: ShiftCard[]) => patchState(store, { cards }),
            setMonthYear: (monthYear: string) => setMonthYear(monthYear),
            setSelectedCard: (card: ShiftCard | null) => patchState(store, { selectedCard: card }),
            setSelectedShift: (shift: Shift) => patchState(store, { selectedShift: shift }),
            getCards: () => getCards(),
            setSlideIndex: (sliceIndex: number) => patchState(store, setSlideIndexAndPosition(sliceIndex, store.uniqueUsers())),
            toggleCalendar: () => patchState(store, toggleCalendar()),
            closeCalendar: () => patchState(store, closeCalendar()),
            allToPdf: () => onAllToPdf(),
            slideTo,
            consumeSlideToIndex,
            toPdfCard: () => toPdfCard(),
            setSelectedCardPosition: (position: string) => patchState(store, setSelectedCardPosition(position)),
            requestDeleteCard: () => {
                confirmationStore.openConfirmation(
                    CONFIRM_ACTIONS.DELETE_SHIFT_CARD,
                    'Opravdu chceš smazat kartu?'
                );
            },
            requestDeleteShift: () => {
                confirmationStore.openConfirmation(
                    CONFIRM_ACTIONS.DELETE_SHIFT,
                    'Opravdu chceš smazat směnu?'
                );
            },
            addShift: () => {
                const initial = store.initialShift();
                patchState(store, setSelectedShift(initial, store.isPastCard(), store.monthYear()));
                store.shiftModel.set({
                    date: initial.date,
                    from: setTime('11:00', initial.date),
                    to: setTime(store.selectedShift().to!, initial.date),
                    perso: ''
                });
                patchState(store, { isAddShiftDialogRequested: true });
            },
            clearAddShiftDialogRequest: () => {
                patchState(store, { isAddShiftDialogRequested: false });
            },
            createUpdateShift: () => { createUpdateShift() },
            updateShift: (shift: Shift) => {
                patchState(store, setSelectedShift(shift, store.isPastCard(), store.monthYear()));
                store.shiftModel.set({
                    date: shift.date,
                    from: setTime(shift.from!, shift.date),
                    to: setTime(shift.to!, shift.date),
                    perso: shift.perso ? shift.perso : ''
                });
                patchState(store, { isAddShiftDialogRequested: true });
            },
            setDefaultMonthYear: () => patchState(store, { monthYear: initializeMonthYear() })
        }
    }),
)