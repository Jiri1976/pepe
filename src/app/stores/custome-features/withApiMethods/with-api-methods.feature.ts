import { signalStoreFeature, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tap, switchMap } from 'rxjs';
import { patchState } from '@ngrx/signals';
import { handleApiResponse } from '../../handle-api-response.operator';

export function withApiMethods() {
    return signalStoreFeature(
        withMethods((store: any) => {

            const apiMethod = <TInput, TResult>(
                serviceCall: (input: TInput) => any,
                config: {
                    start?: () => void;
                    finish?: () => void;
                    success?: (result: TResult) => void;
                    successMessage?: string;
                }
            ) =>
                rxMethod<TInput>((input$) =>
                    input$.pipe(
                        tap(() => config.start?.()),
                        switchMap((input) =>
                            serviceCall(input).pipe(
                                handleApiResponse(store._toaster, {
                                    successMessage: config.successMessage,
                                    onSuccess: (result: TResult) => {
                                        config.success?.(result);
                                        config.finish?.();
                                    },
                                    onError: () => config.finish?.()
                                })
                            )
                        )
                    )
                );

            return {
                apiMethod
            };
        })
    );
}