import { inject, Injectable, signal } from '@angular/core';
import { HotToastService } from '@ngxpert/hot-toast';

@Injectable({
    providedIn: 'root'
})
export class ToasterService {
    toaster = inject(HotToastService);
    notifications = signal<string[]>([]);

    success(message: string) {
        this.toaster.success(message);
    }

    error(message: string) {
        this.toaster.error(message);
    }

    warning(message: string) {
        this.toaster.warning(message);
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