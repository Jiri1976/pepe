import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../stores/auth-store/auth.store';

export const TokenInterceptor: HttpInterceptorFn = (req, next) => {
    const authStore = inject(AuthStore);
    if (authStore.user()?.token) {
        const cloned = req.clone({
            headers: req.headers.set('Authorization', 'Bearer ' + authStore.user()?.token)
        });
        return next(cloned);
    }
    return next(req);
};