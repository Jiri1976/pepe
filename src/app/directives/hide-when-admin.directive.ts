import { Directive, HostBinding, inject } from '@angular/core';
import { AuthStore } from '../stores/auth-store/auth.store';

@Directive({
    selector: '[hideAdmin]',
    standalone: true
})
export class HideWhenAdminDirective {
    readonly authStore = inject(AuthStore);
    @HostBinding('style.display') display: string | null = null;

    constructor() { }

    ngOnInit() {
        this.display = this.authStore.user()?.role === 'Master' ? null : 'none';
    }
}