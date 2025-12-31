import { PartialStateUpdater } from "@ngrx/signals";
import { ConfirmationSlice } from "./confirmation.slice";

export function open(text: string, action: string): PartialStateUpdater<ConfirmationSlice> {
    return _ => ({
        isOpen: true,
        text,
        action
    });
}

export function clear(): PartialStateUpdater<ConfirmationSlice> {
    return _ => ({
        isOpen: false,
        text: '',
        action: ''
    });
}

export function close(): PartialStateUpdater<ConfirmationSlice> {
    return _ => ({
        isOpen: false
    });
}