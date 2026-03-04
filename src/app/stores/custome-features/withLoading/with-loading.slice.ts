export interface LoadingSlice {
    readonly isLoading: boolean;
    readonly isSaving: boolean;
    readonly isDeleting: boolean;
    readonly isPdfLoading: boolean;
    readonly pdfButtonLoading: boolean;
    readonly isDeletingCard: boolean;
    readonly showCalendar: boolean;
    readonly defaultDate: Date;
    readonly maxDate: Date;
}

export const initialLoadingSlice: LoadingSlice = {
    isLoading: false,
    isSaving: false,
    isDeleting: false,
    isPdfLoading: false,
    pdfButtonLoading: false,
    isDeletingCard: false,
    showCalendar: false,
    defaultDate: new Date(new Date().getFullYear(), new Date().getMonth()),
    maxDate: new Date(new Date().getFullYear(), new Date().getMonth())
}