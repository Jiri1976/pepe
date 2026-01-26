import { Directive, output, inject, ElementRef, Renderer2, OnDestroy } from '@angular/core';

@Directive({
    selector: '[clickOutside]'
})
export class ClickOutsideDirective implements OnDestroy {
    clickOutside = output<void>();
    private readonly elementRef = inject(ElementRef);
    private readonly renderer = inject(Renderer2);
    private listener: (() => void) | null = null;

    constructor() {
        this.listener = this.renderer.listen(
            'document',
            'click',
            (e: Event) => {
                if (!this.elementRef.nativeElement.contains(e.target)) {
                    this.clickOutside.emit();
                }
            }
        )
    }

    ngOnDestroy() {
        this.listener?.();
    }
}