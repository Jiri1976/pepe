import { patchState, signalStore, withHooks, withMethods, withProps, withState } from "@ngrx/signals";
import { initialUsersSlice } from "./users.slice";


export const UsersStore = signalStore({
    providedIn: 'root'
},
    withState(initialUsersSlice),
    withProps(_ => {
        const _PER_PAGE = 10;

        return {
            _PER_PAGE
        };
    }),
    withMethods(store => {
        return {

        }
    })
)