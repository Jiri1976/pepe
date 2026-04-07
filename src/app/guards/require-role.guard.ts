import { inject } from "@angular/core";
import { AuthStore } from "../stores/auth-store/auth.store";
import { CanActivateFn, Router } from "@angular/router";

export function requireRole(...roles: string[]): CanActivateFn {
    return () => {

        const auth = inject(AuthStore);
        const router = inject(Router);

        if (roles.includes(auth.user()!.role!)) {
            return true;
        }

        //router.navigate(['/main']);
        return router.createUrlTree(['/unauthorized']);
        return false;
    };
}