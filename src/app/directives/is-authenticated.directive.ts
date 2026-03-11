import { Directive, effect, HostBinding, inject } from '@angular/core';
import { AuthStore } from '../stores/auth-store/auth.store';

@Directive({
    selector: '[appIsAuthenticated]'
})
export class IsAuthenticated {
    readonly store = inject(AuthStore);
    @HostBinding('style.display') display: string | null = null;

    constructor() {
        effect(() => {
            this.display = this.store.user() ? null : 'none';
        });
    }
}