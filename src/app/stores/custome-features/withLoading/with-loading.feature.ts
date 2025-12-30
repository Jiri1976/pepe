import { signalStoreFeature, SignalStoreFeature, withComputed, withState } from "@ngrx/signals";
import { LoadingSlice, initialLoadingSlice } from "./with-loading.slice";
import { computed } from "@angular/core";

export function withLoading(): SignalStoreFeature<{
    state: {},
    props: {},
    methods: {}
}, {
    state: LoadingSlice,
    props: {
        isIdle: boolean
    },
    methods: {}
}>;

export function withLoading(): SignalStoreFeature {
    return signalStoreFeature(
        withState(initialLoadingSlice),
        withComputed(store => ({
            isIdle: computed(() => !store.isLoading)
        }))
    )
}