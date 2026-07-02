import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProposalsComponent } from '../../components/proposals/proposals.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AuthStore } from '../../stores/auth-store/auth.store';
import { ProposalStore } from '../../stores/proposal-store/proposal.store';
import { NavigationComponent } from '../../components/navigation/navigation.component';
import { NavButtonComponent } from '../../components/navigation/nav-button.component';
import { Dialog } from '@angular/cdk/dialog';
import { InactiveUsersComponent } from '../../components/proposals/inactive-users/inactive-users.component';
import { DestinationButtonComponent } from '../../components/paging/destination-button.component';
import { CalendarComponent } from '../../components/calendar/calendar.component';

@Component({
  selector: 'app-plans',
  imports: [
    ProposalsComponent,
    DialogModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    NavigationComponent,
    NavButtonComponent,
    DestinationButtonComponent,
    CalendarComponent,
  ],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.scss',
})
export class PlansComponent {
  readonly authStore = inject(AuthStore);
  readonly propStore = inject(ProposalStore);
  private dialog = inject(Dialog);

  onSelectMonth(date: Date) {
    if (!this.propStore.isUnchanged()) {
      this.propStore.requestSetMonth(date);
    } else {
      this.propStore.setMonthYear(date);
    }
    this.propStore.closeCalendar();
  }

  onToggleCalendar(event: MouseEvent) {
    event.stopPropagation();
    if (this.propStore.isCalendarOpen()) {
      this.propStore.closeCalendar();
    } else {
      this.propStore.openCalendar();
    }
  }

  openModal(selectedInactive: 'Cook' | 'Driver' | 'Pizza' | 'Helper') {
    this.propStore.setSelectedInactive(selectedInactive);
    this.dialog.open(InactiveUsersComponent, { disableClose: false });
  }

  onChangeDestination(destination: string) {
    this.propStore.setDestination(destination);
  }

  onReset() {
    if (!this.propStore.isUnchanged()) {
      this.propStore.requestResetProposals();
    } else {
      this.propStore.uploadSchedulesShifts();
    }
  }

  onOpenPDF() {
    if (!this.propStore.isUnchanged()) {
      this.propStore.requestGetPdf();
    } else {
      this.propStore.getPdf();
    }
  }
}
