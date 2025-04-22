import { Injectable, signal } from "@angular/core";
import { Alert } from "../models/alert.interface";

@Injectable({
    providedIn: 'root'
})
export class AlertService {
    alert = signal<Alert>({ severity: 'success', summary: '', detail: '' });
    resetPassword = signal<boolean>(false);

    setAlert(alert: Alert) {
        this.alert.set(alert);
    }

    openResetPassword() {
        this.resetPassword.set(true);
    }

    closeResetPassword() {
        this.resetPassword.set(false);
    }
}