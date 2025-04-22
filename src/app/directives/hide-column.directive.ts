import { Directive, effect, HostBinding, Input, signal } from '@angular/core';

@Directive({
    selector: '[hideColumn]',
    standalone: true
})
export class HideColumnDirective {
    private displaySignal = signal<boolean>(false);

    @Input('hideColumn')
    set display(value: boolean) {
        this.displaySignal.set(value);
    }

    @HostBinding('style.display')
    displayValue: 'none' | null = null;

    constructor() {
        effect(() => {
            this.displayValue = this.displaySignal() ? 'none' : null;
        });
    }
}