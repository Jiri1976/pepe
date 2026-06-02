import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { initialAuthSlice } from './auth.slice';
import { computed, effect, inject } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { onLogin, onLogout } from './auth.updaters';
import { Router } from '@angular/router';
import {
  getToken,
  isTokenExpired,
  saveSelectedDestination,
} from './auth.helpers';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap, tap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { tapResponse } from '@ngrx/operators';
import { withLoading } from '../custome-features/withLoading/with-loading.feature';
import {
  setIsLoading,
  setNotLoading,
} from '../custome-features/withLoading/with-loading.updaters';
import { withToaster } from '../custome-features/withToaster/with-toaster.feature';
import { SignalRStore } from '../signalr-store/signalr.store';

export const AuthStore = signalStore(
  {
    providedIn: 'root',
  },
  withState(initialAuthSlice),
  withLoading(),
  withToaster(),
  withProps((_) => {
    const _dialog = inject(Dialog);
    const _router = inject(Router);
    const _authService = inject(AuthService);
    const signalR = inject(SignalRStore);

    return {
      _dialog,
      _router,
      _authService,
      signalR,
    };
  }),
  withComputed((store) => {
    const isLoggedIn = computed(() => !!store.user());

    return {
      isLoggedIn,
    };
  }),
  withMethods((store) => {
    const initializeSignalRUser = (token: string) => {
      patchState(store, onLogin(token));
      store.signalR.setToken(token);

      const user = store.user();
      if (user) {
        store.signalR.setSignalRUser({
          name: user.name,
          destination: user.destination,
          role: user.role,
        });
      }
    };

    const onSubmit = rxMethod<{ email: string; password: string }>((input$) =>
      input$.pipe(
        tap((_) => patchState(store, setIsLoading())),
        switchMap((data) =>
          store._authService.login(data).pipe(
            tapResponse({
              next: async (response) => {
                if (response === null) {
                  patchState(store, setNotLoading());
                  store.error('Něco se pokazilo, zkus to znovu.');
                } else if (response.isSuccess === false) {
                  patchState(store, setNotLoading());
                  store.error(response.errorMessage);
                } else {
                  initializeSignalRUser(response.result);
                  try {
                    await store.signalR.start();
                  } catch {
                    store.error('Nepodařilo se připojit k živým aktualizacím.');
                  }

                  patchState(store, setNotLoading());
                  await store._router.navigateByUrl('/main');
                }
              },
              error: () => patchState(store, setNotLoading()),
            }),
          ),
        ),
      ),
    );

    return {
      submit: (loginRequest: { email: string; password: string }) => {
        onSubmit(loginRequest);
      },
      login: async (token: string) => {
        initializeSignalRUser(token);
        try {
          await store.signalR.start();
        } catch {
          store.error('Nepodařilo se připojit k živým aktualizacím.');
        }
        await store._router.navigateByUrl('/main');
      },
      selectDestination: async (destination: string) => {
        const user = store.user();
        if (!user) {
          return;
        }

        const updatedUser = {
          ...user,
          destination,
        };

        patchState(store, {
          user: updatedUser,
          destinationSelected: true,
        });
        saveSelectedDestination(destination);

        store.signalR.setSignalRUser({
          name: updatedUser.name,
          destination: updatedUser.destination,
          role: updatedUser.role,
        });

        await store._router.navigateByUrl('/main');
      },
      logOut: () => {
        store.signalR.clearSignalRUser();
        store.signalR.leaveRoom();
        patchState(store, onLogout(store._dialog, store._router));
      },
      autoLogout: (expirationDuration: number) => {
        patchState(store, {
          _tokenExpirationTimer: setTimeout(() => {
            store.signalR.leaveRoom();
            patchState(store, onLogout(store._dialog, store._router));
          }, expirationDuration),
        });
      },
      restoreLogin: async (token: string) => {
        initializeSignalRUser(token);
        try {
          await store.signalR.start();
        } catch {
          store.error('Nepodařilo se připojit k živým aktualizacím.');
        }
      },
    };
  }),
  withHooks((store) => ({
    onInit: () => {
      const token = getToken();
      if (token) {
        if (isTokenExpired(token)) {
          store.logOut();
        } else {
          store.restoreLogin(token);
        }

        if (store._tokenExpirationTimer === null) {
          store.autoLogout(store.user()?.expireTime ?? 0);
        }
      } else {
        store.logOut();
      }

      effect(() => {
        if (store._tokenExpirationTimer !== null) {
          if (store.user()?.expireTime && store.user()!.expireTime > 0) {
            store.autoLogout(store.user()!.expireTime);
          }
        }
      });
    },
  })),
);
