import { CONFIRM_ACTIONS, ConfirmAction } from "./confirmation.actions";

export interface ConfirmSlice {
    readonly isOpen: boolean;
    readonly text: string;
    readonly action: ConfirmAction;
    readonly payload: unknown | null
}

export const initialConfirmSlice: ConfirmSlice = {
    isOpen: false,
    text: '',
    action: CONFIRM_ACTIONS.NO_ACTION,
    payload: null
};