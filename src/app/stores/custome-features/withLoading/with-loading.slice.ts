export interface LoadingSlice {
    readonly isLoading: boolean;
    readonly isSaving: boolean;
    readonly isDeleting: boolean;
    readonly isPdfLoading: boolean;
    readonly showCalendar: boolean;
    readonly defaultDate: Date;
}

export const initialLoadingSlice: LoadingSlice = {
    isLoading: false,
    isSaving: false,
    isDeleting: false,
    isPdfLoading: false,
    showCalendar: false,
    defaultDate: new Date(new Date().getFullYear(), new Date().getMonth())

}