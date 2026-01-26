import { signalStore } from "@ngrx/signals";
import { withConfirmation } from "./with-confirmation.feature";

export const ConfirmationStore = signalStore({
    providedIn: 'root'
},
    withConfirmation()
)