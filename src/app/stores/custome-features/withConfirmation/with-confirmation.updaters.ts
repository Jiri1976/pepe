import { PartialStateUpdater } from '@ngrx/signals';
import { ConfirmSlice } from './with-confirmation.slice';
import { CONFIRM_ACTIONS, ConfirmAction } from './confirmation.actions';

export function openConfirm(action: ConfirmAction, text: string, payload?: unknown): PartialStateUpdater<ConfirmSlice> {
    return _ => ({
        isOpen: true,
        action,
        text,
        payload: payload ?? null
    });
}

export function closeConfirm(): PartialStateUpdater<ConfirmSlice> {
    return _ => ({
        isOpen: false,
        action: CONFIRM_ACTIONS.NO_ACTION,
        text: ''
    });
};