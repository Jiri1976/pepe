import { Component, inject, OnInit, CUSTOM_ELEMENTS_SCHEMA, ElementRef, effect, viewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ShiftCardComponent } from '../../components/shifts/shift-card/shift-card.component';
import Swiper from 'swiper';
import { FormsModule } from '@angular/forms';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { AuthStore } from '../../stores/auth-store/auth.store';
import { ShiftsStore } from '../../stores/shifts-store/shifts.store';
import { ShiftSkeletonComponent } from '../../components/shifts/shift-skeleton/shift-skeleton.component';
import { MONTHS_NUM } from '../../helpers/common-constants.helper';
import { NavigationComponent } from '../../components/navigation/navigation.component';
import { NavButtonComponent } from '../../components/navigation/nav-button.component';
import { Dialog } from '@angular/cdk/dialog';
import { ShiftFormComponent } from '../../components/shifts/shift-form/shift-form.component';
import { SelectUserComponent } from '../../components/shifts/select-user/select-user.component';
import { PagingComponent } from '../../components/paging/paging.component';
import { PrevNextButtonComponent } from '../../components/paging/prev-next-button.component';
import { DestinationButtonComponent } from "../../components/paging/destination-button.component";
import { ShiftHeaderComponent } from '../../components/shifts/shift-header/shift-header.component';

@Component({
  selector: 'app-plans',
  imports: [
    DialogModule,
    ButtonModule,
    ShiftCardComponent,
    DatePicker,
    DatePickerModule,
    FormsModule,
    ShiftSkeletonComponent,
    NavigationComponent,
    NavButtonComponent,
    PagingComponent,
    PrevNextButtonComponent,
    DestinationButtonComponent,
    ShiftHeaderComponent,
  ],
  templateUrl: './shifts.component.html',
  styleUrl: './shifts.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ShiftsComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly shiftsStore = inject(ShiftsStore);
  private dialog = inject(Dialog);
  calendar = viewChild<DatePicker>('calendar');
  swiperRef = viewChild<ElementRef>('swiperRef');

  openAddSiftDialogEffect = effect(() => {
    if (!this.shiftsStore.isAddShiftDialogRequested()) return;
    if (this.dialog.openDialogs.length > 0) return;

    this.dialog.open(ShiftFormComponent, { disableClose: false })
      .closed.subscribe(() => {
        this.shiftsStore.clearAddShiftDialogRequest();
      });
  });

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
    const user = this.authStore.user();
    this.shiftsStore.setDefaultMonthYear();
    if (user?.role === 'master' && user.destination !== this.shiftsStore.destination()) {
      this.shiftsStore.setDestination(user.destination);
    }
    this.shiftsStore.getCards();
  }

  onCalendarClickOutside(event: MouseEvent, toggleBtn?: HTMLElement) {
    const target = event.target as HTMLElement;
    if (toggleBtn?.contains(target)) {
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
    let _monthYear = MONTHS_NUM[this.calendar()?.value.getMonth()] + this.calendar()?.value.getFullYear();
    this.shiftsStore.setMonthYear(_monthYear);
  }

  onToggleCalendar(event: MouseEvent) {
    event.stopPropagation();
    this.shiftsStore.toggleCalendar();
  }

  openModal() {
    this.dialog.open(SelectUserComponent, { disableClose: false });
  }

  changeDestination(destination: 'F-M' | 'OVA') {
    if (destination !== this.shiftsStore.destination()) {
      this.shiftsStore.setDestination(destination);
    }
    return;
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