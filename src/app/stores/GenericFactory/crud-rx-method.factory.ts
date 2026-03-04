import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { patchState } from '@ngrx/signals';
import { switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

export function createRxCrudMethod<TInput, TResponse>(config: {
    store: any;
    call: (input: TInput) => any;
    startLoading: () => any;
    stopLoading: () => any;
    toaster: any;
    onSuccess?: (response: TResponse, input: TInput) => void;
    successMessage?: string | ((response: TResponse) => string);
    closeDialog?: () => void;
}) {
    return rxMethod<TInput>((input$) =>
        input$.pipe(
            tap(() => patchState(config.store, config.startLoading())),
            switchMap((input) =>
                config.call(input).pipe(
                    tapResponse({
                        next: (response: any) => {
                            patchState(config.store, config.stopLoading());

                            if (!response) {
                                config.toaster.error('Něco se pokazilo, zkus to znovu.');
                                return;
                            }

                            if (!response.isSuccess) {
                                config.toaster.error(response.errorMessage);
                                return;
                            }

                            config.onSuccess?.(response.result, input);

                            if (config.successMessage) {
                                const msg =
                                    typeof config.successMessage === 'function'
                                        ? config.successMessage(response.result)
                                        : config.successMessage;

                                config.toaster.success(msg);
                            }

                            config.closeDialog?.();
                        },
                        error: () =>
                            patchState(config.store, config.stopLoading()),
                    })
                )
            )
        )
    );
}