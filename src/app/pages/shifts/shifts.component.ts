import { Component, inject, OnInit, CUSTOM_ELEMENTS_SCHEMA, ElementRef, effect, viewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ShiftCardComponent } from '../../components/shifts/shift-card/shift-card.component';
import Swiper from 'swiper';
import { ShiftsNavComponent } from "../../components/shifts/shifts-nav/shifts-nav.component";
import { FormsModule } from '@angular/forms';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { AuthStore } from '../../stores/auth-store/auth.store';
import { ShiftsStore } from '../../stores/shifts-store/shifts.store';
import { ShiftSkeletonComponent } from '../../components/shifts/shift-skeleton/shift-skeleton.component';

@Component({
  selector: 'app-plans',
  imports: [
    DialogModule,
    ButtonModule,
    ShiftCardComponent,
    ShiftsNavComponent,
    DatePicker,
    DatePickerModule,
    FormsModule,
    ShiftSkeletonComponent
  ],
  templateUrl: './shifts.component.html',
  styleUrl: './shifts.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ShiftsComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly shiftsStore = inject(ShiftsStore);
  calendar = viewChild<DatePicker>('calendar');
  swiperRef = viewChild<ElementRef>('swiperRef');

  constructor() {
    effect(() => {
      if (this.calendar) {
        if (!this.shiftsStore.showCalendar()) {
          this.calendar()?.hideOverlay();
          this.calendar()?.cd.detectChanges();
        } else {
          this.calendar()?.showOverlay();
          this.calendar()?.cd.detectChanges();
        }
      }
    });
  }

  ngOnInit(): void {
    this.shiftsStore.getCards();
  }

  onCalendarClickOutside(event: MouseEvent, toggleBtn: HTMLElement) {
    const target = event.target as HTMLElement;
    if (toggleBtn.contains(target)) {
      return;
    }
    this.shiftsStore.closeCalendar();
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

  onSelectDestination(destination: string) {
    this.shiftsStore.setDestination(destination);
  }

  onSelectMonth() {
    let _monthYear = this.shiftsStore.MONTHS_NUM[this.calendar()?.value.getMonth()] + this.calendar()?.value.getFullYear();
    this.shiftsStore.setMonthYear(_monthYear);
  }
}