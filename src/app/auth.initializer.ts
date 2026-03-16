import { inject } from "@angular/core";
import { AuthStore } from "./stores/auth-store/auth.store";
import { getToken, isTokenExpired } from "./stores/auth-store/auth.helpers";

export function initializeAuth() {
    const authStore = inject(AuthStore);

    const token = getToken();

    if (token && !isTokenExpired(token)) {
        authStore.restoreLogin(token);
    }
}