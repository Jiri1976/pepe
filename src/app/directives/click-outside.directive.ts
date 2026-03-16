import { Directive, ElementRef, output, HostListener, inject } from '@angular/core';

@Directive({
    selector: '[clickOutside]'
})
export class ClickOutsideDirective {

    clickOutside = output<void>();
    private elementRef = inject(ElementRef);

    private initialized = false;

    constructor() {
        setTimeout(() => {
            this.initialized = true;
        });
    }

    @HostListener('document:click', ['$event'])
    onClick(event: Event) {
        if (!this.initialized) return;

        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.clickOutside.emit();
        }
    }
}