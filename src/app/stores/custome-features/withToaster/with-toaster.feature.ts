import { inject } from "@angular/core";
import { signalStoreFeature, withMethods, withProps } from "@ngrx/signals";
import { HotToastService } from "@ngxpert/hot-toast";

export function withToaster() {
    return signalStoreFeature(

        withProps(() => ({
            _toaster: inject(HotToastService)
        })),

        withMethods((store) => ({
            success(message: string) {
                store._toaster.success(message);
            },

            error(message: string) {
                store._toaster.error(message);
            },

            warning(message: string) {
                store._toaster.warning(message);
            },
        }))
    );
}