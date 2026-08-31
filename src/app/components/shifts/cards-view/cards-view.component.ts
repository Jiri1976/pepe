import { Component, effect, inject, signal } from '@angular/core';
import { PagingComponent } from '../../paging/paging.component';
import { AuthStore } from '../../../stores/auth-store/auth.store';
import { ShiftsStore } from '../../../stores/shifts-store/shifts.store';
import { PrevNextButtonComponent } from '../../paging/prev-next-button.component';
import { ShiftSkeletonComponent } from '../shift-skeleton/shift-skeleton.component';
import { ShiftCardComponent } from '../shift-card/shift-card.component';
import { InfoButtonComponent } from '../../paging/info-button.component';

@Component({
  selector: 'app-cards-view',
  imports: [
    PagingComponent,
    PrevNextButtonComponent,
    ShiftSkeletonComponent,
    ShiftCardComponent,
    InfoButtonComponent,
  ],
  templateUrl: './cards-view.component.html',
  styleUrls: ['./cards-view.component.scss'],
})
export class CardsViewComponent {
  readonly authStore = inject(AuthStore);
  readonly shiftsStore = inject(ShiftsStore);
  readonly activeSlide = signal(0);
  readonly revealedSlide = signal(0);
  readonly revealFromTopRight = signal(false);
  private firstFrame?: number;
  private secondFrame?: number;

  ngOnInit(): void {
    const user = this.authStore.user();
    this.shiftsStore.setDefaultMonthYear();
    if (
      user?.role === 'Master' &&
      user.destination !== this.shiftsStore.destination()
    ) {
      this.shiftsStore.setDestination(user.destination);
    }
    this.shiftsStore.getCards();
  }

  movePrevious() {
    if (this.shiftsStore.sliceIndex() === 0) {
      return;
    }
    this.shiftsStore.closeInfo();
    this.shiftsStore.slideTo(this.shiftsStore.sliceIndex() - 1);
  }

  moveNext() {
    if (
      this.shiftsStore.sliceIndex() ===
      this.shiftsStore.uniqueUsers().length - 1
    ) {
      return;
    }
    this.shiftsStore.closeInfo();
    setTimeout(() => {
      this.shiftsStore.slideTo(this.shiftsStore.sliceIndex() + 1);
    }, 300);
  }

  readonly syncClipSlide = effect(() => {
    const requestedIndex = this.shiftsStore.consumeSlideToIndex();
    if (requestedIndex === null) return;

    const lastIndex = this.shiftsStore.uniqueUsers().length - 1;
    const index = Math.max(0, Math.min(requestedIndex, lastIndex));
    const currentIndex = this.activeSlide();
    const fromTopRight = index < currentIndex;

    this.showSlide(index, fromTopRight);
    this.shiftsStore.setSlideIndex(index);
  });

  private showSlide(index: number, fromTopRight: boolean): void {
    if (index < 0 || index >= this.shiftsStore.uniqueUsers().length) return;

    if (this.firstFrame) cancelAnimationFrame(this.firstFrame);
    if (this.secondFrame) cancelAnimationFrame(this.secondFrame);

    this.activeSlide.set(index);
    this.revealFromTopRight.set(fromTopRight);

    this.firstFrame = requestAnimationFrame(() => {
      this.secondFrame = requestAnimationFrame(() => {
        this.revealedSlide.set(index);
      });
    });
  }

  ngOnDestroy(): void {
    if (this.firstFrame) cancelAnimationFrame(this.firstFrame);
    if (this.secondFrame) cancelAnimationFrame(this.secondFrame);
  }
}
