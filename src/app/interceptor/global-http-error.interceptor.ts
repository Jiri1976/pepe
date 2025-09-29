import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, retry, throwError } from 'rxjs';
import { AlertService } from '../services/alert.service';
import { AuthService } from '../services/auth.service';

export const globalHttpErrorInterceptor: HttpInterceptorFn = (req, next) => {
    const alertService = inject(AlertService);
    const authService = inject(AuthService);

    const handled$ = req.method === 'GET'
        ? next(req).pipe(retry({ count: 1, delay: 1000 }))
        : next(req);

    return handled$.pipe(
        catchError((error: HttpErrorResponse) => {
            let alertDetail = 'Vyskytla se chyba!';

            if (error.status === 401) {
                alertDetail = 'Chybí ti oprávnění, zkus se přihlásit.';
                alertService.setAlert({ severity: 'error', summary: 'Error', detail: alertDetail });
                authService.logout();
                return throwError(() => error);
            }

            if (error.error?.errorMessage) {
                alertDetail = error.error.errorMessage;
            } else if (error.error?.message) {
                alertDetail = error.error.message;
            }

            alertService.setAlert({ severity: 'error', summary: 'Error', detail: alertDetail });
            return throwError(() => error);
        })
    );
};
