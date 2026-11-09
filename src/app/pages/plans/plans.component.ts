import { Component, HostListener, inject, signal } from '@angular/core';
import { ConfirmationComponent } from '../../components/confirmation/confirmation.component';
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
import { firstValueFrom } from 'rxjs';

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
  private dialog = inject(Dialog);
  readonly authStore = inject(AuthStore);
  readonly propStore = inject(ProposalStore);
  menuShown = signal(true);
  width = signal(window.innerWidth);

  @HostListener('window:resize')
  onWindowResize() {
    this.width.set(window.innerWidth);
    if (this.width() > 690) {
      this.menuShown.set(true);
    }
  }

  async onSelectMonth(date: Date) {
    if (!this.propStore.isUnchanged()) {
      const dialogRef = this.dialog.open<boolean>(ConfirmationComponent, {
        disableClose: false,
        data: { text: 'Nejsou uloženy změny, chceš pokračovat?' },
      });
      const result = await firstValueFrom(dialogRef.closed);

      if (result !== true) {
        return;
      }

      this.propStore.setMonthYear(date);
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

  async onReset() {
    if (!this.propStore.isUnchanged()) {
      const dialogRef = this.dialog.open<boolean>(ConfirmationComponent, {
        disableClose: false,
        data: { text: 'Nejsou uloženy změny, chceš pokračovat?' },
      });
      const result = await firstValueFrom(dialogRef.closed);

      if (result !== true) {
        return;
      }
      this.propStore.uploadSchedulesShifts();
    } else {
      this.propStore.uploadSchedulesShifts();
    }
  }

  async onOpenPDF() {
    if (!this.propStore.isUnchanged()) {
      const dialogRef = this.dialog.open<boolean>(ConfirmationComponent, {
        disableClose: false,
        data: { text: 'Nejsou uloženy změny, chceš pokračovat?' },
      });
      const result = await firstValueFrom(dialogRef.closed);

      if (result !== true) {
        return;
      }
      this.propStore.getPdf();
    } else {
      this.propStore.getPdf();
    }
  }

  async deleteProposalCard() {
    const dialogRef = this.dialog.open<boolean>(ConfirmationComponent, {
      disableClose: false,
      data: {
        text: `Odstranit plán směn pro ${this.propStore.destination()} - ${this.propStore.currentCard()!.monthYearName.toLowerCase()}?`,
      },
    });
    const result = await firstValueFrom(dialogRef.closed);

    if (result !== true) {
      return;
    }
    this.propStore.deleteProposalCard();
  }

  onOpenAI() {
    this.propStore.openConstraints();
  }

  hideMenu() {
    this.menuShown.set(false);
  }

  showMenu() {
    this.menuShown.set(true);
  }
}
