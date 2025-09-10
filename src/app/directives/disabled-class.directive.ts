import { Directive, HostBinding, HostListener, inject, Input } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AuthUser } from '../models/auth-user.interface';

@Directive({
    selector: '[disabledClass]',
    standalone: true
})
export class DisabledClassDirective {
    private authService = inject(AuthService);
    private user!: AuthUser;

    ngOnInit() {
        this.user = this.authService.getUser();
    }

    @Input('disabledClass')
    @HostBinding('class.disabled')
    disabled = false;

    @HostBinding('style.cursor')
    get cursor(): string {
        return this.disabled && this.user.role === 'Master' ? 'default' : 'pointer';
    }

    @HostListener('click', ['$event'])
    handleClick(event: Event): void {
        if (this.disabled) {
            event.stopImmediatePropagation();
            event.preventDefault();
        }
    }
}