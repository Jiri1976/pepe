import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthStore } from "../stores/auth-store/auth.store";

export const RoleGuard: CanActivateFn = (route) => {
    const auth = inject(AuthStore);
    const router = inject(Router);

    const user = auth.user();
    if (!user) {
        router.navigate(['/login']);
        return false;
    }

    const roles = route.data['role'];
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (allowedRoles.includes(user.role)) {
        return true;
    }

    router.navigate(['/main']);
    return false;
};