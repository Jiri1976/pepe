import { Injectable, signal } from "@angular/core";
import { Alert } from "../models/alert.interface";

@Injectable({
    providedIn: 'root'
})
export class AlertService {
    notifications = signal<string[]>([]);
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

    removeNotifications(index: number) {
        if (this.notifications().length === 0) {
            return;
        }
        let messages: string[] = [];
        const localStorageMessages = localStorage.getItem("notifications");

        if (localStorageMessages) {
            try {
                messages = JSON.parse(localStorageMessages);
            } catch (err) {
                console.error('ALERT SERVICE - REMOVE NOTIFICATIONS - Failed to parse notifications from localStorage:', err);
                messages = [];
            }
        }

        if (messages.length > 0) {
            messages.splice(index, 1);
            this.notifications.set(messages);
            localStorage.setItem('notifications', JSON.stringify(messages));
        }
    }

    checkNotifications(message: string, check: string) {
        let messages: string[] = [];
        const localStorageMessages = localStorage.getItem("notifications");

        if (localStorageMessages) {
            try {
                messages = JSON.parse(localStorageMessages);
            } catch (err) {
                console.error('ALERT SERVICE - Failed to parse notifications from localStorage:', err);
                messages = [];
            }
        }

        const indexForRemove = messages.findIndex(mess => mess.includes(check));
        if (indexForRemove !== -1) {
            messages.splice(indexForRemove, 1);
        }

        messages.push(message);
        this.notifications.set(messages);
        localStorage.setItem('notifications', JSON.stringify(messages));
    }
}