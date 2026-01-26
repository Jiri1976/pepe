import { patchState, signalStoreFeature, SignalStoreFeature, withMethods, withProps, withState } from "@ngrx/signals";
import { inject } from "@angular/core";
import { Dialog } from "@angular/cdk/dialog";
import { ConfirmSlice, initialConfirmSlice } from "./with-confirmation.slice";
import { ConfirmationComponent } from "../../../components/confirmation/confirmation.component";
import { closeConfirm, openConfirm } from "./with-confirmation.updaters";
import { ConfirmAction } from "./confirmation.actions";

export function withConfirmation(): SignalStoreFeature<
    { state: {}; props: {}; methods: {} },
    {
        state: ConfirmSlice;
        props: { dialog: Dialog };
        methods: {
            openConfirmation: (action: ConfirmAction, text: string, payload?: unknown) => void;
            registerHandler: (action: ConfirmAction, handler: (payload: unknown) => void) => void;
            confirm: () => void;
            cancel: () => void;
        };
    }
> {
    return signalStoreFeature(
        withState(initialConfirmSlice),

        withProps(() => ({
            dialog: inject(Dialog)
        })),
        withMethods(store => {
            const handlers = new Map<ConfirmAction, (payload: unknown) => void>();

            return {
                registerHandler(action: ConfirmAction, handler: (payload: unknown) => void) {
                    handlers.set(action, handler);
                },

                openConfirmation(action: ConfirmAction, text: string, payload?: unknown) {
                    patchState(store, openConfirm(action, text, payload));
                    const ref = store.dialog.open<boolean>(ConfirmationComponent, {
                        data: { action, text },
                        backdropClass: 'confirmation-backdrop'
                    });
                    ref.closed.subscribe(() => patchState(store, closeConfirm()));
                },

                confirm() {
                    const action = store.action();
                    const payload = store.payload();
                    handlers.get(action)?.(payload);
                    //patchState(store, closeConfirm());
                },

                cancel() {
                    //patchState(store, closeConfirm());
                }
            };
        })
    );
}

