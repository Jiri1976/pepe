import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
  withHooks,
} from '@ngrx/signals';
import { computed, effect, inject, signal } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap, tap } from 'rxjs';
import { withLoading } from '../custome-features/withLoading/with-loading.feature';
import {
  setIsLoading,
  setIsSaving,
  setNotSaving,
  setNotLoading,
  setIsDeleting,
  setNotDeleting,
  toggleIsPdfLoading,
} from '../custome-features/withLoading/with-loading.updaters';
import { initialProposalSlice } from './proposal.slice';
import { ProposalsService } from '../../services/proposals.service';
import {
  addFromInactive,
  removeFromActive,
  resetCalendar,
  setMonthYear,
  setOriginal,
  setSchedules,
  updatePositions,
  setSelectedProposal,
  deleteProposal,
  updateProposal,
} from './proposals.updaters';
import { deepEqual, sortInactiveUsers } from './proposal.helpers';
import { withConfirmation } from '../custome-features/withConfirmation/with-confirmation.feature';
import { ConfirmationStore } from '../custome-features/withConfirmation/confirmation.store';
import { CONFIRM_ACTIONS } from '../custome-features/withConfirmation/confirmation.actions';
import { UpdateProposalComponent } from '../../components/proposals/update-proposal/update-proposal.component';
import {
  createToaster,
  downloadPdf,
  // getMessageTime,
  // isCurrentMonthYear,
  setTime,
} from '../../helpers/common-functions.helper';
import { handleApiResponse } from '../handle-api-response.operator';
import { AuthStore } from '../auth-store/auth.store';
import {
  Proposal,
  ProposalCard,
  ProposalShift,
  ProposalUser,
  Inputs,
} from '../../models/proposals.interface';
import { withToaster } from '../custome-features/withToaster/with-toaster.feature';
import { SignalRStore } from '../signalr-store/signalr.store';
import { Router } from '@angular/router';
import { ShiftsStore } from '../shifts-store/shifts.store';
import { withCalendar } from '../custome-features/withCalendar/with-calendar.feature';

export const ProposalStore = signalStore(
  {
    providedIn: 'root',
  },
  withConfirmation(),
  withState(initialProposalSlice),
  withLoading(),
  withToaster(),
  withCalendar(),
  withProps((_) => {
    const _dialog = inject(Dialog);
    const _proposalService = inject(ProposalsService);
    const _auth = inject(AuthStore);
    const _signalR = inject(SignalRStore);
    const _shiftsStore = inject(ShiftsStore);
    const _router = inject(Router);
    const proposalModel = signal<Proposal>({
      timeFrom: null,
      timeTo: null,
    });

    return {
      _dialog,
      _proposalService,
      proposalModel,
      _auth,
      _signalR,
      _shiftsStore,
      _router,
    };
  }),
  withComputed((store) => {
    effect(() => {
      const selected = store.selectedProposal();
      if (!selected) return;

      store.proposalModel.set({
        timeFrom: setTime(selected.from, selected.proposalDate),
        timeTo: setTime(selected.to, selected.proposalDate),
      });
    });

    const currentCard = computed(() => {
      return store
        .schedules()
        .find((c) => c.destination === store.destination());
    });

    const oppositeCard = computed(() => {
      return store
        .schedules()
        .find((c) => c.destination !== store.destination());
    });

    const isUnsavedPassedCard = computed(() => {
      const card = store
        .schedules()
        .find((c) => c.destination === store.destination());
      if (!card) {
        return false;
      }
      let today = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      let day = new Date(
        parseInt(card!.monthYear.substring(2, 6)),
        parseInt(card!.monthYear.substring(0, 2)) - 1,
        1,
      );
      if (day >= today) {
        return false;
      }

      if (card!.users?.length > 0) {
        return false;
      }
      return true;
    });

    const atLeastOneSavedShift = computed(() => {
      const card = store
        .schedules()
        .find((c) => c.destination === store.destination());
      if (!card || !card.users) {
        return false;
      }

      return card.users.some((user) =>
        user.shifts.some((shift) => shift.id > 0),
      );
    });

    const isPassedCard = computed(() => {
      const card = store
        .schedules()
        .find((c) => c.destination === store.destination());
      let today = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      let _monthYear =
        card!.monthYear.length === 5 ? '0' + card!.monthYear : card!.monthYear;

      let day = new Date(
        parseInt(_monthYear.substring(2, 6)),
        parseInt(_monthYear.substring(0, 2)) - 1,
        1,
      );
      if (day >= today) {
        return false;
      }
      return true;
    });

    const isUnchanged = computed(() => {
      const current = store.schedules();
      const original = store._original();

      if (current.length === 0 && original.length === 0) {
        return true;
      }

      return deepEqual(current, original);
    });

    const helpers = computed(() => {
      const card = store
        .schedules()
        .find((c) => c.destination === store.destination());
      const helpers =
        card?.inactiveUsers.filter((u) => u.position === 'Helper') ?? [];
      return sortInactiveUsers(helpers);
    });

    const drivers = computed(() => {
      const card = store
        .schedules()
        .find((c) => c.destination === store.destination());
      const drivers =
        card?.inactiveUsers.filter((u) => u.position === 'Driver') ?? [];
      return sortInactiveUsers(drivers);
    });

    const pizza = computed(() => {
      const card = store
        .schedules()
        .find((c) => c.destination === store.destination());
      const pizza =
        card?.inactiveUsers.filter((u) => u.position === 'Pizza') ?? [];
      return sortInactiveUsers(pizza);
    });

    const cooks = computed(() => {
      const card = store
        .schedules()
        .find((c) => c.destination === store.destination());
      const cooks =
        card?.inactiveUsers.filter((u) => u.position === 'Cook') ?? [];
      return sortInactiveUsers(cooks);
    });

    const hasUsers = computed(() => {
      const card = currentCard();
      if (!card) return false;
      if (!card.users) return false;
      return card.users.length > 0;
    });

    const signalDestination = computed(() => {
      if (store._auth?.user()?.role === 'Master') {
        return store._auth?.user()?.destination ?? '';
      }

      const fmChanged =
        JSON.stringify(
          store.schedules().find((c) => c.destination === 'F-M'),
        ) !==
        JSON.stringify(store._original().find((c) => c.destination === 'F-M'));
      const ovaChanged =
        JSON.stringify(
          store.schedules().find((c) => c.destination === 'OVA'),
        ) !==
        JSON.stringify(store._original().find((c) => c.destination === 'OVA'));
      if (fmChanged && !ovaChanged) {
        return 'F-M';
      } else if (!fmChanged && ovaChanged) {
        return 'OVA';
      } else {
        return 'all';
      }
    });

    return {
      currentCard,
      isUnsavedPassedCard,
      atLeastOneSavedShift,
      isPassedCard,
      isUnchanged,
      helpers,
      drivers,
      pizza,
      cooks,
      oppositeCard,
      hasUsers,
      signalDestination,
    };
  }),
  withMethods((store) => {
    const toaster = createToaster(store);
    const confirmationStore = inject(ConfirmationStore);

    const uploadSchedulesShifts = rxMethod<void>((input$) =>
      input$.pipe(
        tap((_) => patchState(store, setIsLoading())),
        switchMap((_) =>
          store._proposalService.getScheduledShifts(store.monthYear()).pipe(
            handleApiResponse(toaster, {
              onSuccess: (schedules: ProposalCard[]) => {
                patchState(store, setNotLoading());

                if (store._auth.user()?.role !== 'Admin') {
                  patchState(store, {
                    destination: store._auth.user()?.destination,
                  });
                }

                patchState(store, setSchedules(schedules));
                patchState(store, { isCalendarOpen: false });

                if (!store.destination() && schedules.length > 0) {
                  patchState(store, { destination: schedules[0].destination });
                }
              },
              onError: () => patchState(store, setNotLoading()),
            }),
          ),
        ),
      ),
    );

    // const silentlyUploadSchedulesShifts = rxMethod<void>((input$) =>
    //   input$.pipe(
    //     switchMap((_) =>
    //       store._proposalService.getScheduledShifts(store.monthYear()).pipe(
    //         handleApiResponse(toaster, {
    //           onSuccess: (schedules: ProposalCard[]) => {
    //             patchState(store, setSchedules(schedules));
    //           },
    //           onError: () =>
    //             console.log(
    //               'Nepodařilo se načíst směny po aktualizaci přes signalR',
    //             ),
    //         }),
    //       ),
    //     ),
    //   ),
    // );

    const getPdf = rxMethod<void>((input$) =>
      input$.pipe(
        tap((_) => patchState(store, toggleIsPdfLoading())),
        switchMap((_) =>
          store._proposalService.uploadPDF(store.currentCard()!).pipe(
            handleApiResponse(toaster, {
              onSuccess: (file) => {
                patchState(store, toggleIsPdfLoading());
                downloadPdf(
                  file,
                  `Směny - ${store.currentCard()!.destination} - ${store.currentCard()!.monthYearName.toLowerCase()}`,
                );
              },
              onError: () => patchState(store, toggleIsPdfLoading()),
            }),
          ),
        ),
      ),
    );

    const saveProposals = rxMethod<void>((input$) =>
      input$.pipe(
        tap((_) => patchState(store, setIsSaving())),
        switchMap((_) =>
          store._proposalService.saveProposals(store.schedules()).pipe(
            handleApiResponse(toaster, {
              successMessage: 'Úspěšně uloženo!',
              onSuccess: (schedules) => {
                // const loggedInUser = store._auth.user();
                // if (!loggedInUser) {
                //   return;
                // }
                // const messageToSend = `${getMessageTime()} ${loggedInUser.name}: Uložen plán směn`;
                // store._signalR.updateSignalProposals(
                //   loggedInUser.name,
                //   store.signalDestination(),
                //   schedules,
                //   messageToSend,
                // );
                patchState(store, setNotSaving());
                patchState(store, setSchedules(schedules));
              },
              onError: () => patchState(store, setNotSaving()),
            }),
          ),
        ),
      ),
    );

    const deleteCard = rxMethod<void>((input$) =>
      input$.pipe(
        tap((_) => patchState(store, setIsDeleting())),
        switchMap((_) =>
          store._proposalService
            .deleteProposalCard(store.monthYear(), store.destination())
            .pipe(
              handleApiResponse(toaster, {
                successMessage: 'Směny byly odstraněny!',
                onSuccess: (schedules) => {
                  // const loggedInUser = store._auth.user();
                  // if (!loggedInUser) {
                  //   return;
                  // }
                  // const messageToSend = `${getMessageTime()} ${loggedInUser.name}: Směny byly odstraněny`;
                  // store._signalR.updateSignalProposals(
                  //   loggedInUser.name,
                  //   store.signalDestination(),
                  //   schedules,
                  //   messageToSend,
                  // );
                  patchState(store, setNotDeleting());
                  patchState(store, setSchedules(schedules));
                  patchState(store, setOriginal());
                },
                onError: () => patchState(store, setNotDeleting()),
              }),
            ),
        ),
      ),
    );

    const selectProposal = (selectedProposal: ProposalShift) => {
      patchState(store, setSelectedProposal(selectedProposal));
      store.dialog.open(UpdateProposalComponent, { disableClose: false });
    };

    confirmationStore.registerHandler(
      CONFIRM_ACTIONS.DELETE_PROPOSAL_CARD,
      () => {
        deleteCard();
      },
    );

    confirmationStore.registerHandler(CONFIRM_ACTIONS.RESET_PROPOSALS, () => {
      uploadSchedulesShifts();
    });

    confirmationStore.registerHandler(
      CONFIRM_ACTIONS.SELECT_MONTH,
      (monthYear: unknown) => {
        patchState(store, setMonthYear(monthYear as Date));
        uploadSchedulesShifts();
      },
    );

    confirmationStore.registerHandler(CONFIRM_ACTIONS.GET_PDF, () => {
      getPdf();
    });

    return {
      setDestination: (destination: string) =>
        patchState(store, { destination }),
      setSchedules: (schedules: ProposalCard[]) =>
        patchState(store, { schedules }),
      resetCalendar: () => patchState(store, resetCalendar()),
      uploadSchedulesShifts: () => uploadSchedulesShifts(),
      getPdf: () => getPdf(),
      saveProposals: () => saveProposals(),
      setMonthYear: (monthYear: Date) => {
        patchState(store, setMonthYear(monthYear));
        uploadSchedulesShifts();
      },
      removeFromActive: (
        user: ProposalUser,
        index: number,
        userShfts: ProposalShift[],
      ) =>
        patchState(
          store,
          removeFromActive(user, index, store.currentCard()!, userShfts),
        ),
      addFromInactive: (user: ProposalUser) =>
        patchState(
          store,
          addFromInactive(
            user,
            store.selectedInactive()!,
            store.currentCard()!,
            store.oppositeCard()!,
          ),
        ),
      setSelectedInactive: (
        selectedInactive: 'Cook' | 'Driver' | 'Pizza' | 'Helper',
      ) => patchState(store, { selectedInactive }),
      updatePositions: (currentIndex: number, targetIndex: number) =>
        patchState(
          store,
          updatePositions(currentIndex, targetIndex, store.destination()),
        ),
      resetToOriginal: () =>
        patchState(store, { schedules: structuredClone(store._original()) }),
      requestDeleteProposalCard: (text: string) => {
        confirmationStore.openConfirmation(
          CONFIRM_ACTIONS.DELETE_PROPOSAL_CARD,
          text,
        );
      },
      requestResetProposals: () => {
        confirmationStore.openConfirmation(
          CONFIRM_ACTIONS.RESET_PROPOSALS,
          'Nejsou uloženy změny, chceš pokračovat?',
        );
      },
      requestSetMonth: (monthYear: Date) => {
        confirmationStore.openConfirmation(
          CONFIRM_ACTIONS.SELECT_MONTH,
          'Nejsou uloženy změny, chceš pokračovat?',
          monthYear,
        );
      },
      requestGetPdf: () => {
        confirmationStore.openConfirmation(
          CONFIRM_ACTIONS.GET_PDF,
          'Nejsou uloženy změny, chceš pokračovat?',
        );
      },
      selectProposal: (selectedProposal: ProposalShift) =>
        selectProposal(selectedProposal),
      deleteProposal: () =>
        patchState(store, deleteProposal(store.oppositeCard())),
      updateProposal: (inputs: Inputs) =>
        patchState(store, updateProposal(inputs)),
      // silentlyUploadSchedulesShifts: () => silentlyUploadSchedulesShifts(),
    };
  }),
  withHooks({
    onInit(store) {
      // effect(() => {
      //   const update = store._signalR.updateSignalRProposals();

      //   if (
      //     update &&
      //     store._router.url === '/plans' &&
      //     isCurrentMonthYear(store.monthYear())
      //   ) {
      //     store.silentlyUploadSchedulesShifts();
      //   }

      //   if (update && store._router.url === '/shifts/daily') {
      //     store._shiftsStore.getSilentlyShiftsForToday();
      //   }
      //   store._signalR.setUpdateSignalRProposalsToFalse();
      // });
      effect(() => {
        const received = store._signalR.sProposals();

        if (
          received &&
          received.length > 0 &&
          // store._router.url === '/plans' &&
          received[0].monthYear === store.monthYear()
        ) {
          if (store._auth.user()?.role === 'Master') {
            if (
              !deepEqual(
                store.currentCard(),
                received.find((c) => c.destination === store.destination()),
              )
            ) {
              store._signalR.addNotifications(
                store._signalR.sProposalMessage() ?? '',
              );
              patchState(store, { schedules: received });
            }
          } else {
            store._signalR.addNotifications(
              store._signalR.sProposalMessage() ?? '',
            );
            patchState(store, { schedules: received });
          }
          //patchState(store, { schedules: received });
          store._signalR.clearSchedules();
        }
      });
    },
  }),
);
