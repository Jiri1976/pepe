import { Component, computed, inject, model, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule, Calendar } from 'primeng/calendar';
import { DatePickerModule } from 'primeng/datepicker';
import { HideElementDirective } from '../../../directives/hide-element.directive';
import { HideWhenAdminDirective } from '../../../directives/hide-when-admin.directive';
import { ProposalsService } from '../../../services/proposals.service';
import { PlansComponent } from '../../../pages/plans/plans.component';

@Component({
  selector: 'app-proposals-nav',
  imports: [HideElementDirective, CalendarModule, DatePickerModule, FormsModule, HideWhenAdminDirective],
  templateUrl: './proposals-nav.component.html',
  styleUrl: './proposals-nav.component.scss'
})
export class ProposalsNavComponent {
  private proposalsService = inject(ProposalsService);
  plansComponent = inject(PlansComponent);
  isOpened = signal(false);
  calendarTitle = computed(() => this.proposalsService.calendarTitle());
  defaultDate = new Date(new Date().getFullYear(), new Date().getMonth());
  minDate: Date = new Date(new Date().getFullYear(), new Date().getMonth());
  destination = computed(() => this.proposalsService.destination());
  pdfLoading = model(false);
  users = computed(() => this.proposalsService.users());
  @ViewChild('calendar', { static: false }) calendar!: Calendar;

  onOpen() {
    this.isOpened.set(!this.isOpened());
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
    this.plansComponent.onSelectMonth(this.calendar.value);
  }
}
