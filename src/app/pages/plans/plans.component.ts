import { Component, effect, inject, viewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { ProposalsComponent } from '../../components/proposals/proposals.component';
import { OverlayModule } from 'primeng/overlay';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AuthStore } from '../../stores/auth-store/auth.store';
import { ProposalStore } from '../../stores/proposal-store/proposal.store';
import { NavigationComponent } from "../../components/navigation/navigation.component";
import { NavButtonComponent } from "../../components/navigation/nav-button.component";
import { Dialog } from '@angular/cdk/dialog';
import { InactiveUsersComponent } from '../../components/proposals/inactive-users/inactive-users.component';
import { DestinationButtonComponent } from "../../components/paging/destination-button.component";

@Component({
  selector: 'app-plans',
  imports: [
    ProposalsComponent,
    DialogModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    DatePickerModule,
    DatePicker,
    OverlayModule,
    DragDropModule,
    NavigationComponent,
    NavButtonComponent,
    DestinationButtonComponent
  ],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.scss'
})
export class PlansComponent {
  readonly authStore = inject(AuthStore);
  readonly propStore = inject(ProposalStore);
  calendar = viewChild<DatePicker>('calendar');
  showCalendar = this.propStore.showCalendar;
  private dialog = inject(Dialog);

  constructor() {
    effect(() => {
      if (this.calendar) {
        if (!this.showCalendar()) {
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

    this.propStore.closeCalendar();
  }

  onSelectMonth(date: Date) {
    if (!this.propStore.isUnchanged()) {
      this.propStore.requestSetMonth(date);
    } else {
      this.propStore.setMonthYear(date);
    }
  }

  onToggleCalendar(event: MouseEvent) {
    event.stopPropagation();
    this.propStore.toggleCalendar();
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