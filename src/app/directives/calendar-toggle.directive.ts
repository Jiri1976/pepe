import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[appCalendarToggle]',
    standalone: true
})
export class CalendarToggleDirective {
    @Input('appCalendarToggle') calendar: any;

    constructor(private el: ElementRef) { }

    @HostListener('click') toggleCalendar() {
        if (this.calendar) {
            if (this.calendar.overlayVisible) {
                this.calendar.hideOverlay();
                this.calendar.cd.detectChanges();
            } else {
                this.calendar.showOverlay();
                this.calendar.cd.detectChanges();
            }
        }
    }
}