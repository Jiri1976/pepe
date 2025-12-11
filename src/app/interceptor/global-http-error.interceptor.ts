import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, retry, throwError } from 'rxjs';
import { ToasterService } from '../services/toaster.service';
import { AuthStore } from '../stores/auth-store/auth.store';

export const globalHttpErrorInterceptor: HttpInterceptorFn = (req, next) => {
    const toaster = inject(ToasterService);
    const authStore = inject(AuthStore);

    const handled$ = req.method === 'GET'
        ? next(req).pipe(retry({ count: 1, delay: 1000 }))
        : next(req);

    return handled$.pipe(
        catchError((error: HttpErrorResponse) => {
            let alertDetail = 'Vyskytla se chyba!';

            if (error.status === 401) {
                alertDetail = 'Chybí ti oprávnění, zkus se přihlásit.';
                toaster.error(alertDetail);
                authStore.logOut();
                return throwError(() => error);
            }

            if (error.error?.errorMessage) {
                alertDetail = error.error.errorMessage;
            } else if (error.error?.message) {
                alertDetail = error.error.message;
            }

            toaster.error(alertDetail);
            return throwError(() => error);
        })
    );
};
