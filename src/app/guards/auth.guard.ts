import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanMatchFn = async (route, segments) => {
    try {
        const router = inject(Router);
        const authService = inject(AuthService);

        if (authService.isLoggedIn()) {
            return true;
        }
        router.navigate(['/']);
        return false;
    } catch (e) {
        console.log('Auth guard error: ', e);
        throw e;
    }
};

