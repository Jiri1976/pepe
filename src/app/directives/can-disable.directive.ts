import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
    selector: '[canDisable]',
    standalone: true
})
export class CanDisableDirective {
    @Input()
    @HostBinding('class.disabled')
    disabled = false;

    @HostBinding('attr.disabled')
    protected get nativeDisabled(): '' | null {
        return this.disabled ? '' : null;
    }
}