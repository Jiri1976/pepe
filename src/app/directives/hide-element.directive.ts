import { Directive, HostBinding, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
    selector: '[hide]',
    standalone: true
})
export class HideElementDirective {
    private authService = inject(AuthService);
    @HostBinding('style.display') display: string | null = null;

    constructor() { }

    ngOnInit() {
        const user = this.authService.getUser();
        this.display = user.role === 'Admin' ? null : 'none';
    }
}