import { inject } from "@angular/core";
import { CanMatchFn } from "@angular/router";
import { ToasterService } from "../services/toaster.service";
import { AuthStore } from "../stores/auth-store/auth.store";

export const AdminMasterGuard: CanMatchFn = async (route, segments) => {
    try {
        const roles = route.data!['role'] as string[];
        const authStore = inject(AuthStore);
        const toaster = inject(ToasterService);

        if (!authStore.user()) {
            toaster.error("Nejsi prihlášený!");
            authStore.logOut();
            return false;
        }
        if (roles.some((role) => authStore.user()?.role.includes(role))) {
            return true;
        }
        toaster.error("Nemáš oprávnění vidět tuto stránku.");
        return false;
    } catch (e) {
        console.log('Auth guard error: ', e);
        throw e;
    }
};