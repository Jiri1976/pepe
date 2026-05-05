import { signalStore } from "@ngrx/signals";
import { withSignalR } from "../custome-features/with-signalR/with-signalR.feature";

export const SignalRStore = signalStore(
    { providedIn: 'root' },
    withSignalR()
);