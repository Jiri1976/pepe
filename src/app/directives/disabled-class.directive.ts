import { Directive, HostBinding, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[disabledClass]',
    standalone: true
})
export class DisabledClassDirective {
    @Input('disabledClass')
    @HostBinding('class.disabled')
    disabled = false;

    @HostBinding('style.cursor')
    get cursor(): string {
        return this.disabled ? 'default' : 'pointer';
    }

    @HostListener('click', ['$event'])
    handleClick(event: Event): void {
        if (this.disabled) {
            event.stopImmediatePropagation();
            event.preventDefault();
        }
    }
}