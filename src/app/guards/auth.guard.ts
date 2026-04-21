import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../stores/auth-store/auth.store';

export const AuthGuard: CanActivateFn = () => {
    const auth = inject(AuthStore);
    const router = inject(Router);

    if (auth.isLoggedIn()) {
        return true;
    }

    router.navigate(['/login']);
    return false;
};