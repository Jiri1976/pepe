import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthStore } from '../stores/auth-store/auth.store';

export const AuthGuard: CanMatchFn = async (route, segments) => {
    try {
        const router = inject(Router);
        const authStore = inject(AuthStore);

        if (authStore.user()) {
            return true;
        }
        router.navigate(['/']);
        return false;
    } catch (e) {
        console.log('Auth guard error: ', e);
        throw e;
    }
};

