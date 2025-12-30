export interface LoadingSlice {
    readonly isLoading: boolean;
    readonly isSaving: boolean;
    readonly isDeleting: boolean;
}

export const initialLoadingSlice: LoadingSlice = {
    isLoading: false,
    isSaving: false,
    isDeleting: false
}