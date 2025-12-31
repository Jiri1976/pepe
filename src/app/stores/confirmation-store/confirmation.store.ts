import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { initialConfirmationSlice } from "./confirmation.slice";
import { open, clear, close } from "./confirmation.updaters";

export const ConfirmationStore = signalStore({
    providedIn: 'root'
},
    withState(initialConfirmationSlice),
    withMethods(store => {
        return {
            open: (text: string, action: string) => patchState(store, open(text, action)),
            clear: () => patchState(store, clear()),
            close: () => patchState(store, close())
        }
    })
)