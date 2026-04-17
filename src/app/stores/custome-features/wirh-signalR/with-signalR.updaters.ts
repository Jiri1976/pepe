import { PartialStateUpdater } from "@ngrx/signals";
import { SignalRSlice } from "./with-signalR.slice";

export function removeNotifications(index: number): PartialStateUpdater<SignalRSlice> {
    return store => {
        if (store.notifications.length === 0) {
            return { notifications: [] }
        }
        let messages = [...store.notifications];

        if (messages.length > 0) {
            messages.splice(index, 1);
        }

        return {
            notifications: messages
        };
    }
}