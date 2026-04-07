import { inject } from "@angular/core";
import { patchState, signalStoreFeature, withMethods, withProps, withState } from "@ngrx/signals";
import { HotToastService } from "@ngxpert/hot-toast";
import { initialToasterSlice } from "./with-toaster.slice";
import { loadNotifications, saveNotifications } from "./with-toaster.helpers";

export function withToaster() {
    return signalStoreFeature(
        withState({
            ...initialToasterSlice,
            notifications: loadNotifications()
        }),

        withProps(() => ({
            _toaster: inject(HotToastService)
        })),

        withMethods((store) => ({
            success(message: string) {
                store._toaster.success(message);
            },

            error(message: string) {
                store._toaster.error(message);
            },

            warning(message: string) {
                store._toaster.warning(message);
            },

            checkNotifications(message: string, check: string) {
                const messages = [...store.notifications()];

                const index = messages.findIndex(m => m.includes(check));
                if (index !== -1) {
                    messages.splice(index, 1);
                }

                messages.push(message);

                saveNotifications(messages);
                patchState(store, { notifications: messages });
            },

            removeNotifications(index: number) {
                const messages = [...store.notifications()];

                if (messages.length === 0) return;

                messages.splice(index, 1);

                saveNotifications(messages);
                patchState(store, { notifications: messages });
            }
        }))
    );
}