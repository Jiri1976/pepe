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

export function setNotDeleting(): PartialStateUpdater<LoadingSlice> {
    return _ => ({ isDeleting: false });
}

export function toggleIsLoading(): PartialStateUpdater<LoadingSlice> {
    return state => ({ isLoading: !state.isLoading });
}