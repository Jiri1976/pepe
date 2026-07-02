import {
  Directive,
  effect,
  ElementRef,
  input,
  HostBinding,
  HostListener,
  inject,
} from '@angular/core';

@Directive({
  selector: 'app-calendar',
  standalone: true,
})
export class CalendarAvailableDirective {
  readonly isOpen = input.required<() => boolean>();
  readonly onClose = input.required<() => void>();

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private isOpenPrev = false;
  private ignoreDocumentClick = false;

  @HostBinding('style.display') display: string | null = null;

  constructor() {
    effect(() => {
      const isOpen = this.isOpen()();

      if (isOpen && !this.isOpenPrev) {
        this.ignoreDocumentClick = true;
        setTimeout(() => {
          this.ignoreDocumentClick = false;
        });
      }

      this.isOpenPrev = isOpen;
      this.display = isOpen ? null : 'none';
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.isOpen()() || this.ignoreDocumentClick) {
      return;
    }

    const host = this.elementRef.nativeElement;
    const target = event.target;

    if (!(target instanceof Node)) {
      return;
    }

    const path =
      typeof event.composedPath === 'function' ? event.composedPath() : [];
    const clickedInside = path.includes(host) || host.contains(target);

    if (!clickedInside) {
      this.onClose()();
    }
  }
}
