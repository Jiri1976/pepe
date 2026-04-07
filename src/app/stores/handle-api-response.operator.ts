import { tapResponse } from '@ngrx/operators';
import { ApiResponse } from './api-response.interface';

export function handleApiResponse<T>(
    toaster: {
        success: (msg: string) => void;
        error: (msg: string) => void;
    },
    config: {
        onSuccess: (result: T) => void;
        onError?: () => void;
        successMessage?: string;
    }
) {
    return tapResponse<ApiResponse<T> | null>({
        next: (response) => {
            if (!response) {
                toaster.error('Něco se pokazilo, zkus to znovu.');
                config.onError?.();
                return;
            }

            if (!response.isSuccess) {
                toaster.error(response.errorMessage ?? 'Chyba serveru');
                config.onError?.();
                return;
            }

            if (config.successMessage) {
                toaster.success(config.successMessage);
            }

            config.onSuccess(response.result);
        },

        error: () => {
            //toaster.error('Server error');
            config.onError?.();
        }
    });
}