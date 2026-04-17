import { signalStoreFeature, SignalStoreFeature, withState } from "@ngrx/signals";
import { LoadingSlice, initialLoadingSlice } from "./with-loading.slice";

export function withLoading(): SignalStoreFeature<{
    state: {},
    props: {},
    methods: {}
}, {
    state: LoadingSlice,
    props: {},
    methods: {}
}>;

export function withLoading(): SignalStoreFeature {
    return signalStoreFeature(
        withState(initialLoadingSlice)
    )
}