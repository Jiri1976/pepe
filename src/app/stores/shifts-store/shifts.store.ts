import { patchState, signalStore, withComputed, withMethods, withProps, withState } from "@ngrx/signals";
import { inject } from "@angular/core";
import { Dialog } from '@angular/cdk/dialog';
import { ToasterService } from "../../services/toaster.service";
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap, tap } from "rxjs";
import { tapResponse } from '@ngrx/operators';
import { withLoading } from "../custome-features/withLoading/with-loading.feature";
import { closeCalendar, setIsLoading, setIsSaving, setNotSaving, setNotLoading, setIsDeleting, setNotDeleting, toggleCalendar, toggleIsPdfLoading } from "../custome-features/withLoading/with-loading.updaters";
import { withConfirmation } from "../custome-features/withConfirmation/with-confirmation.feature";
import { ConfirmationStore } from "../custome-features/withConfirmation/confirmation.store";
import { initialShiftsSlice } from "./shifts.slice";
import { ShiftService } from "../../services/shift.service";

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

        return {
            _dialog,
            _toaster,
            _shiftService
        };
    }),
    withComputed(store => {


        return {

        }
    }),
    withMethods(store => {
        const confirmationStore = inject(ConfirmationStore);

        const getCards = rxMethod<void>(input$ => input$.pipe(
            tap(_ => patchState(store, setIsLoading())),
            switchMap(_ => store._shiftService.getUsersShiftCards(store.monthYear(), store.destination()).pipe(
                tapResponse({
                    next: response => {
                        patchState(store, setNotLoading());
                        if (response === null) {
                            store._toaster.error('Něco se pokazilo, zkus to znovu.');
                        } else if (response.isSuccess === false) {
                            store._toaster.error(response.errorMessage);
                        } else {
                            // if (response.result.length > 0) {
                            //     this.filterUsers(response.result);
                            //     setTimeout(() => {
                            //     this.slideToCard(this.currentIndex());
                            //     }, 100);
                            // } else {
                            //     this.shiftService.uniqueUsers.set([]);
                            //     this.shiftService.checkAllToPdf();
                            // }
                            patchState(store, closeCalendar());
                        }
                    },
                    error: () => patchState(store, setNotLoading())
                })
            ))
        ));

        //         private getCards() {
        //     this.isLoading.set(true);
        //     const subscription = this.shiftService.getUsersShiftCards(this.monthYear(), this.destination()).pipe(
        //       tap(response => {
        //         if (response === null) {
        //           this.isLoading.set(false);
        //           this.toaster.error('Něco se pokazilo, zkus to znovu.');
        //         } else if (response.isSuccess === false) {
        //           this.isLoading.set(false);
        //           this.toaster.error(response.errorMessage);
        //         } else if (response.isSuccess === true) {
        //           if (response.result.length > 0) {
        //             this.filterUsers(response.result);
        //             setTimeout(() => {
        //               this.slideToCard(this.currentIndex());
        //             }, 100);
        //           } else {
        //             this.shiftService.uniqueUsers.set([]);
        //             this.shiftService.checkAllToPdf();
        //           }
        //           this.isLoading.set(false);
        //         }
        //       }),
        //     ).subscribe({
        //       next: () => { },
        //       error: () => this.isLoading.set(false)
        //     });

        //     this.destroyRef.onDestroy(() => {
        //       subscription.unsubscribe();
        //     });
        //   }



        return {
            setDestination: (destination: string) => patchState(store, { destination }),
            // uploadSchedulesShifts: () => uploadSchedulesShifts(),            
        }
    }),
)

