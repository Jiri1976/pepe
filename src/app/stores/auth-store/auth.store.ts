import { patchState, signalStore, withHooks, withMethods, withProps, withState } from "@ngrx/signals";
import { initialAuthSlice } from "./auth.slice";
import { effect, inject } from "@angular/core";
import { Dialog } from '@angular/cdk/dialog';
import { SignalService } from "../../services/signal.service";
import { onLogin, onLogout } from "./auth.updaters";
import { Router } from "@angular/router";
import { ToasterService } from "../../services/toaster.service";
import { getToken, isTokenExpired } from "./auth.helpers";
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap, tap } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { tapResponse } from '@ngrx/operators';
import { withLoading } from "../custome-features/withLoading/with-loading.feature";
import { setIsLoading, setNotLoading } from "../custome-features/withLoading/with-loading.updaters";

export const AuthStore = signalStore({
    providedIn: 'root'
},
    withState(initialAuthSlice),
    withLoading(),
    withProps(_ => {
        const _dialog = inject(Dialog);
        const _signalService = inject(SignalService);
        const _router = inject(Router);
        const _toaster = inject(ToasterService);
        const _authService = inject(AuthService);

        return {
            _dialog,
            _signalService,
            _router,
            _toaster,
            _authService
        };
    }),
    withMethods(store => {
        const onSubmit = rxMethod<{ email: string, password: string }>(input$ => input$.pipe(
            tap(_ => patchState(store, setIsLoading())),
            switchMap(data => store._authService.login(data).pipe(
                tapResponse({
                    next: response => {
                        if (response === null) {
                            patchState(store, setNotLoading());
                            store._toaster.error('Něco se pokazilo, zkus to znovu.');
                        } else if (response.isSuccess === false) {
                            patchState(store, setNotLoading());
                            store._toaster.error(response.errorMessage);
                        } else {
                            patchState(store, onLogin(response.result, store._router, store._signalService))
                            store._router.navigate(['main']);
                        }
                    },
                    error: () => patchState(store, setNotLoading())
                })
            ))
        ))

        return {
            submit: (loginRequest: { email: string, password: string }) => { onSubmit(loginRequest) },
            login: (token: string) => {
                patchState(store, onLogin(token, store._router, store._signalService));
                store._router.navigate(['main']);
            },
            logOut: () => {
                patchState(store, onLogout(store._dialog, store._router, store._toaster, store._signalService));
            },
            autoLogout: (expirationDuration: number) => {
                patchState(store, {
                    _tokenExpirationTimer: setTimeout(() => {
                        patchState(store, onLogout(store._dialog, store._router, store._toaster, store._signalService));
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