import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
    selector: '[setBackground]',
    standalone: true
})
export class SetBackgroundDirective {
    @Input('setBackground') isFridayOrSaturday = false;

    @HostBinding('style.--background-color')
    get backgroundColor(): string {
        return this.isFridayOrSaturday ? '#f7d3af' : '#fff';
    }
}