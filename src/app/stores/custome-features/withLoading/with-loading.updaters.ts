import { PartialStateUpdater } from "@ngrx/signals";
import { LoadingSlice } from "./with-loading.slice";

export function setIsLoading(): PartialStateUpdater<LoadingSlice> {
    return _ => ({ isLoading: true });
}

export function setNotLoading(): PartialStateUpdater<LoadingSlice> {
    return _ => ({ isLoading: false });
}

export function setIsSaving(): PartialStateUpdater<LoadingSlice> {
    return _ => ({ isSaving: true });
}

export function setNotSaving(): PartialStateUpdater<LoadingSlice> {
    return _ => ({ isSaving: false });
}

export function setIsDeleting(): PartialStateUpdater<LoadingSlice> {
    return _ => ({ isDeleting: true });
}

export function toggleIsDeleting(): PartialStateUpdater<LoadingSlice> {
    return state => ({ isDeleting: !state.isDeleting });
}

export function setNotDeleting(): PartialStateUpdater<LoadingSlice> {
    return _ => ({ isDeleting: false });
}

export function setIsDeletingCard(): PartialStateUpdater<LoadingSlice> {
    return _ => ({ isDeletingCard: true });
}

export function setNotDeletingCard(): PartialStateUpdater<LoadingSlice> {
    return _ => ({ isDeletingCard: false });
}

export function toggleIsLoading(): PartialStateUpdater<LoadingSlice> {
    return state => ({ isLoading: !state.isLoading });
}

export function toggleIsPdfLoading(): PartialStateUpdater<LoadingSlice> {
    return state => ({ isPdfLoading: !state.isPdfLoading });
}

export function toggleCalendar(): PartialStateUpdater<LoadingSlice> {
    return state => ({ showCalendar: !state.showCalendar });
}

export function togglePdfButtonLoading(): PartialStateUpdater<LoadingSlice> {
    return state => ({ pdfButtonLoading: !state.pdfButtonLoading });
}

export function toggleIsSaving(): PartialStateUpdater<LoadingSlice> {
    return state => ({ isSaving: !state.isSaving });
}

export function closeCalendar(): PartialStateUpdater<LoadingSlice> {
    return _ => ({ showCalendar: false });
}

export function toggleIsDeletingCard(): PartialStateUpdater<LoadingSlice> {
    return state => ({ isDeletingCard: !state.isDeletingCard });
}