import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToasterService } from '../services/toaster.service';

export const AdminGuard: CanMatchFn = async (route, segments) => {
    try {
        const role = route.data!['role'] as string;
        const authService = inject(AuthService);
        const toaster = inject(ToasterService);
        const user = authService.getUser();

        if (!authService.isLoggedIn()) {
            toaster.error("Nejsi prihlášený!");
            authService.logout();
            return false;
        }
        if (role === user.role) {
            return true;
        }
        toaster.error("Nemáš oprávnění vidět tuto stránku.");
        return false;
    } catch (e) {
        console.log('Auth guard error: ', e);
        throw e;
    }
};
