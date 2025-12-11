import { Directive, HostBinding, inject } from '@angular/core';
import { AuthStore } from '../stores/auth-store/auth.store';

@Directive({
    selector: '[hide]',
    standalone: true
})
export class HideElementDirective {
    private authStore = inject(AuthStore);
    @HostBinding('style.display') display: string | null = null;

    ngOnInit() {
        this.display = this.authStore.user()?.role === 'Admin' ? null : 'none';
    }
}