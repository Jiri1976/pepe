import { Component, computed, inject, model, ViewChild } from '@angular/core';
import { ShiftService } from '../../../services/shift.service';
import { ShiftsComponent } from '../../../pages/shifts/shifts.component';
import { HideElementDirective } from '../../../directives/hide-element.directive';
import { Calendar, CalendarModule } from 'primeng/calendar';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { HideWhenAdminDirective } from '../../../directives/hide-when-admin.directive';

@Component({
  selector: 'app-shifts-nav',
  imports: [HideElementDirective, CalendarModule, DatePickerModule, FormsModule, HideWhenAdminDirective],
  templateUrl: './shifts-nav.component.html',
  styleUrl: './shifts-nav.component.scss'
})
export class ShiftsNavComponent {
  private shiftService = inject(ShiftService);
  shiftsComponent = inject(ShiftsComponent);
  private authService = inject(AuthService);
  shiftFormVisible = computed(() => this.shiftService.shiftFormVisible());
  calendarText = model('');
  destination = model('');
  pdfOn = model(false);
  defaultDate = new Date(new Date().getFullYear(), new Date().getMonth());
  maxDate: Date = new Date(new Date().getFullYear(), new Date().getMonth());
  loggedUser = this.authService.getUser();
  @ViewChild('calendar', { static: false }) calendar!: Calendar;

  onOpen() {
    this.shiftService.shiftFormVisible.set(false);
  }

  toggleCalendar() {
    if (this.calendar) {
      if (this.calendar.overlayVisible) {
        this.calendar.hideOverlay();
        this.calendar.cd.detectChanges();
      } else {
        this.calendar.showOverlay();
        this.calendar.cd.detectChanges();
      }
    }
  }

  onSelectMonth() {
    this.calendar.hideOverlay();
    this.calendar.cd.detectChanges();
    this.shiftsComponent.onSelectMonth(this.calendar.value);
  }
}
