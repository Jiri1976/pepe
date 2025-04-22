import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from './alert.service';
import { AuthService } from './auth.service';
import { throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ErrorHandlingService {
    private alertService = inject(AlertService);
    private authService = inject(AuthService);

    handleError(errorRes: HttpErrorResponse) {
        let errorMessage = 'Vyskytla se chyba!';
        let alertDetail = errorMessage;

        if (errorRes.status === 401) {
            alertDetail = 'Chybí ti oprávnění, zkus se přihlásit.';
            this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: alertDetail });
            this.authService.logout();
            return;
        }

        if (errorRes.error?.errorMessage) {
            alertDetail = errorRes.error.errorMessage;
        } else if (errorRes.error?.message) {
            alertDetail = errorRes.error.message;
        }

        this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: alertDetail });

        return throwError(() => alertDetail);
    }
}