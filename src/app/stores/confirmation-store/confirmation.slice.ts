export interface ConfirmationSlice {
    readonly isOpen: boolean;
    readonly text: string;
    readonly action: string;
}

export const initialConfirmationSlice: ConfirmationSlice = {
    isOpen: false,
    text: '',
    action: ''
}