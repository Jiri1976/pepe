import { tapResponse } from '@ngrx/operators';
import { ToasterService } from '../services/toaster.service';
import { ApiResponse } from './api-response.interface';

export function handleApiResponse<T>(
    toaster: ToasterService,
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
                return;
            }

            if (!response.isSuccess) {
                toaster.error(response.errorMessage ?? 'Chyba serveru');
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