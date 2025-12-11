import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { ToasterService } from '../services/toaster.service';
import { AuthStore } from '../stores/auth-store/auth.store';

export const AdminGuard: CanMatchFn = async (route, segments) => {
    try {
        const role = route.data!['role'] as string;
        const authStore = inject(AuthStore);
        const toaster = inject(ToasterService);

        if (!authStore.user()) {
            toaster.error("Nejsi prihlášený!");
            authStore.logOut();
            return false;
        }
        if (role === authStore.user()?.role) {
            return true;
        }
        toaster.error("Nemáš oprávnění vidět tuto stránku.");
        return false;
    } catch (e) {
        console.log('Auth guard error: ', e);
        throw e;
    }
};
