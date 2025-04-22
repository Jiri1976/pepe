import { Directive, ElementRef, inject, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
    selector: '[spinner]',
    standalone: true,
})
export class SpinnerDirective implements OnChanges {
    private el = inject(ElementRef);
    private renderer = inject(Renderer2);
    private targetElement: HTMLElement | null = null;

    @Input() nullWidthHeight: boolean = false;
    @Input() marginTop: number = 0;

    ngOnChanges(changes: SimpleChanges): void {
        this.targetElement = this.el.nativeElement.querySelector('#spinner');
        if (!this.targetElement) {
            return;
        }
        if (changes['nullWidthHeight']) {
            if (this.nullWidthHeight) {
                this.renderer.setStyle(this.targetElement, 'width', '0px');
                this.renderer.setStyle(this.targetElement, 'height', '0px');
            }
        }
        if (changes['marginTop']) {
            const marginTop = this.marginTop !== 0 ? `${this.marginTop}%` : '';
            this.renderer.setStyle(this.el.nativeElement, 'marginTop', marginTop);
        }
    }
}