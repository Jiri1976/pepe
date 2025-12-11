import { patchState, signalStore, withHooks, withMethods, withProps, withState } from "@ngrx/signals";
import { initialAuthSlice } from "./auth.slice";
import { effect, inject } from "@angular/core";
import { Dialog } from '@angular/cdk/dialog';
import { WarehouseService } from "../../services/warehouse.service";
import { SignalService } from "../../services/signal.service";
import { onLogin, onLogout } from "./auth.updaters";
import { Router } from "@angular/router";
import { ToasterService } from "../../services/toaster.service";
import { getToken, isTokenExpired } from "./auth.helpers";

export const AuthStore = signalStore({
    providedIn: 'root'
},
    withState(initialAuthSlice),
    withProps(_ => {
        const _dialog = inject(Dialog);
        const _warehouseService = inject(WarehouseService);
        const _signalService = inject(SignalService);
        const _router = inject(Router);
        const _toaster = inject(ToasterService);

        return {
            _dialog,
            _warehouseService,
            _signalService,
            _router,
            _toaster
        };
    }),
    withMethods(store => {
        return {
            login: (token: string) => {
                patchState(store, onLogin(token, store._router, store._signalService));
                store._router.navigate(['main']);
            },
            setIsLoading: (isLoading: boolean) => patchState(store, { isLoading }),
            logOut: () => {
                patchState(store, onLogout(store._dialog, store._router, store._toaster, store._warehouseService, store._signalService));
            },
            autoLogout: (expirationDuration: number) => {
                patchState(store, {
                    _tokenExpirationTimer: setTimeout(() => {
                        patchState(store, onLogout(store._dialog, store._router, store._toaster, store._warehouseService, store._signalService));
                    }, expirationDuration)
                });
            }
        }
    }),
    withHooks(store => ({
        onInit: () => {
            const token = getToken();
            if (token) {
                let expired = isTokenExpired(token);
                if (expired) {
                    store.logOut();
                }
                store.login(token);
                if (store._tokenExpirationTimer === null) {
                    store.autoLogout(store.user()?.expireTime ?? 0)
                }
            } else {
                store.logOut();
            }

            effect(() => {
                if (store._tokenExpirationTimer !== null) {
                    if (store.user()?.expireTime && store.user()!.expireTime > 0) {
                        store.autoLogout(store.user()!.expireTime)
                    }
                }
            });
        }
    }))
)