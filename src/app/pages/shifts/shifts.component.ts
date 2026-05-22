import { Component, inject, OnInit, CUSTOM_ELEMENTS_SCHEMA, ElementRef, effect, viewChild, computed, signal } from '@angular/core';
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
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-plans',
  imports: [
    DialogModule,
    ButtonModule,
    DatePicker,
    DatePickerModule,
    FormsModule,
    NavigationComponent,
    NavButtonComponent,
    RouterOutlet
  ],
  templateUrl: './shifts.component.html',
  styleUrl: './shifts.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ShiftsComponent {
  readonly authStore = inject(AuthStore);
  readonly shiftsStore = inject(ShiftsStore);
  private dialog = inject(Dialog);
  private router = inject(Router);
  calendar = viewChild<DatePicker>('calendar');
  pathname = signal(window.location.pathname);

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

  onCalendarClickOutside(event: MouseEvent, toggleBtn?: HTMLElement) {
    const target = event.target as HTMLElement;
    if (toggleBtn?.contains(target)) {
      return;
    }
    this.shiftsStore.closeCalendar();
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

  toDaily() {
    this.pathname.update(() => '/shifts/daily');
    this.router.navigate(['shifts/daily']);
  }

  toShifts() {
    this.pathname.update(() => '/shifts');
    this.router.navigate(['shifts']);
  }

  reload() {
    if (this.pathname() === '/shifts') {
      this.shiftsStore.getCards();
    } else if (this.pathname() === '/shifts/daily') {
      this.shiftsStore.getShiftsForToday();
    }
  }

  addShift() {
    if (this.pathname() === '/shifts') {
      this.shiftsStore.addShift();
    } else if (this.pathname() === '/shifts/daily') {
      if (this.shiftsStore.oneConcurrentErrors()) {
        return;
      }
      if (this.shiftsStore.todaysShifts().users.length === 0) {
        this.shiftsStore.error('Není možné přidat směnu, protože pro dnešní den nejsou načteni žádní uživatelé.');
        return;
      }
      this.shiftsStore.addNewDailyShift();
    }
  }
}