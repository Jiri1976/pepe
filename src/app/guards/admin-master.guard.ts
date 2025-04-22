import { inject } from "@angular/core";
import { CanMatchFn } from "@angular/router";
import { AlertService } from "../services/alert.service";
import { AuthService } from "../services/auth.service";

export const AdminMasterGuard: CanMatchFn = async (route, segments) => {
    try {
        const roles = route.data!['role'] as string[];
        const authService = inject(AuthService);
        const alertService = inject(AlertService);
        const user = authService.getUser();

        if (!authService.isLoggedIn()) {
            alertService.setAlert({ severity: 'error', summary: 'Error', detail: "Nejsi prihlášený!" });
            authService.logout();
            return false;
        }
        if (roles.some((role) => user.role.includes(role))) {
            return true;
        }
        alertService.setAlert({ severity: 'error', summary: 'Error', detail: "Nemáš oprávnění vidět tuto stránku." });
        return false;
    } catch (e) {
        console.log('Auth guard error: ', e);
        throw e;
    }
};