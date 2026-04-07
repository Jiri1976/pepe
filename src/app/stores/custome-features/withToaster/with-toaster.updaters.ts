import { PartialStateUpdater } from "@ngrx/signals";
import { ToasterSlice } from "./with-toaster.slice";

export function checkNotifications(message: string, check: string): PartialStateUpdater<ToasterSlice> {
    return _ => {
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
        localStorage.setItem('notifications', JSON.stringify(messages));

        return {
            notifications: messages
        };
    };
}

export function removeNotifications(index: number): PartialStateUpdater<ToasterSlice> {
    return store => {

        if (store.notifications.length === 0) {
            return { notifications: [] }
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
            localStorage.setItem('notifications', JSON.stringify(messages));
        }

        return {
            notifications: messages
        };
    }
}