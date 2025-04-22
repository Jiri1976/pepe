import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
    selector: '[shiftClass]',
    standalone: true,
})
export class ShiftClassDirective {
    @Input() shift?: { id: number; name: string, from: string, to: string };

    @HostBinding('class')
    protected get computedShiftClass() {
        if (!this.shift || !this.shift.from || !this.shift.to) {
            return 'shift-block custom';
        }
        if (this.shift.from === '11:00' && (this.shift.to === '22:00' || this.shift.to === '23:00')) {
            return 'shift-block whole';
        } else if (this.shift.from === '11:00' && this.shift.to === '17:00') {
            return 'shift-block morning';
        } else if (this.shift.from === '17:00' && (this.shift.to === '22:00' || this.shift.to === '23:00')) {
            return 'shift-block afternoon';
        }
        return 'shift-block custom';
    }
}