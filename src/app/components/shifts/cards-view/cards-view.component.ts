import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, ElementRef, inject, viewChild } from '@angular/core';
import { PagingComponent } from "../../paging/paging.component";
import { AuthStore } from '../../../stores/auth-store/auth.store';
import { ShiftsStore } from '../../../stores/shifts-store/shifts.store';
import Swiper from 'swiper';
import { PrevNextButtonComponent } from "../../paging/prev-next-button.component";
import { DestinationButtonComponent } from "../../paging/destination-button.component";
import { ShiftHeaderComponent } from "../shift-header/shift-header.component";
import { ShiftSkeletonComponent } from "../shift-skeleton/shift-skeleton.component";
import { ShiftCardComponent } from "../shift-card/shift-card.component";

@Component({
  selector: 'app-cards-view',
  imports: [PagingComponent, PrevNextButtonComponent, DestinationButtonComponent, ShiftHeaderComponent, ShiftSkeletonComponent, ShiftCardComponent],
  templateUrl: './cards-view.component.html',
  styleUrl: './cards-view.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CardsViewComponent {
  readonly authStore = inject(AuthStore);
  readonly shiftsStore = inject(ShiftsStore);
  swiperRef = viewChild<ElementRef>('swiperRef');

  ngOnInit(): void {
    const user = this.authStore.user();
    this.shiftsStore.setDefaultMonthYear();
    if (user?.role === 'Master' && user.destination !== this.shiftsStore.destination()) {
      this.shiftsStore.setDestination(user.destination);
    }
    this.shiftsStore.getCards();
  }

  slideToEffect = effect(() => {
    const index = this.shiftsStore.consumeSlideToIndex();
    if (index === null) return;
    const swiper = this.swiperRef()?.nativeElement?.swiper;
    if (swiper) {
      swiper.slideTo(index);
    }
  });

  onSwiperInit() {
    setTimeout(() => {
      const swiper = (this.swiperRef()?.nativeElement as any).swiper;
      if (swiper) {
        swiper.on('slideChange', () => { });
      }
    });
  }

  onSlideChange(event: Event) {
    const swiperInstance = (event.target as any).swiper as Swiper;
    this.shiftsStore.setSlideIndex(swiperInstance.activeIndex);
  }

  movePrevious() {
    if (this.shiftsStore.sliceIndex() === 0) {
      return;
    }
    const swiper = this.swiperRef()?.nativeElement?.swiper;
    if (swiper && !swiper.animating) {
      swiper.slidePrev();
    }
  }

  moveNext() {
    if (this.shiftsStore.sliceIndex() === this.shiftsStore.uniqueUsers().length - 1) {
      return;
    }
    const swiper = this.swiperRef()?.nativeElement?.swiper;
    if (swiper && !swiper.animating) {
      swiper.slideNext();
    }
  }

}
