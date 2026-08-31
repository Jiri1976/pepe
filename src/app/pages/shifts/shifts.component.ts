import {
  Component,
  inject,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../../stores/auth-store/auth.store';
import { ShiftsStore } from '../../stores/shifts-store/shifts.store';
import { MONTHS_NUM } from '../../helpers/common-constants.helper';
import { NavigationComponent } from '../../components/navigation/navigation.component';
import { NavButtonComponent } from '../../components/navigation/nav-button.component';
import { Dialog } from '@angular/cdk/dialog';
import { ShiftFormComponent } from '../../components/shifts/shift-form/shift-form.component';
import { SelectUserComponent } from '../../components/shifts/select-user/select-user.component';
import { Router, RouterOutlet } from '@angular/router';
import { CalendarComponent } from '../../components/calendar/calendar.component';

@Component({
  selector: 'app-plans',
  imports: [
    DialogModule,
    ButtonModule,
    FormsModule,
    NavigationComponent,
    NavButtonComponent,
    RouterOutlet,
    CalendarComponent,
  ],
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ShiftsComponent {
  readonly authStore = inject(AuthStore);
  readonly shiftsStore = inject(ShiftsStore);
  private dialog = inject(Dialog);
  private router = inject(Router);
  pathname = signal(window.location.pathname);

  ngOnInit(): void {
    this.shiftsStore.closeInfo();
  }

  openAddSiftDialogEffect = effect(() => {
    if (!this.shiftsStore.isAddShiftDialogRequested()) return;
    if (this.dialog.openDialogs.length > 0) return;

    this.dialog
      .open(ShiftFormComponent, { disableClose: false })
      .closed.subscribe(() => {
        this.shiftsStore.clearAddShiftDialogRequest();
      });
  });

  onSelectDestination(destination: string) {
    this.shiftsStore.setDestination(destination);
  }

  onSelectMonth(date: Date) {
    let _monthYear = MONTHS_NUM[date.getMonth()] + date.getFullYear();
    this.shiftsStore.setMonthYear(_monthYear);
    this.shiftsStore.closeCalendar();
  }

  onToggleCalendar(event: MouseEvent) {
    event.stopPropagation();
    if (this.shiftsStore.isCalendarOpen()) {
      this.shiftsStore.closeCalendar();
    } else {
      this.shiftsStore.openCalendar();
    }
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
        this.shiftsStore.error(
          'Není možné přidat směnu, protože pro dnešní den nejsou načteni žádní uživatelé.',
        );
        return;
      }
      this.shiftsStore.addNewDailyShift();
    }
  }
}
