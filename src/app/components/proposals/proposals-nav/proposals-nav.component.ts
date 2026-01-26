import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { HideElementDirective } from '../../../directives/hide-element.directive';
import { InactiveUsersComponent } from '../inactive-users/inactive-users.component';
import { Dialog } from '@angular/cdk/dialog';
import { ProposalStore } from '../../../stores/proposal-store/proposal.store';

@Component({
  selector: 'app-proposals-nav',
  imports: [HideElementDirective],
  templateUrl: './proposals-nav.component.html',
  styleUrl: './proposals-nav.component.scss'
})
export class ProposalsNavComponent {
  readonly store = inject(ProposalStore);
  private dialog = inject(Dialog);
  @ViewChild('toggleBtn', { static: true })
  toggleBtn!: ElementRef<HTMLElement>;

  openModal(selectedInactive: 'Cook' | 'Driver' | 'Pizza' | 'Helper') {
    this.store.setSelectedInactive(selectedInactive);
    this.dialog.open(InactiveUsersComponent, { disableClose: false });
  }

  onChangeDestination(destination: string) {
    this.store.setDestination(destination);
  }

  onReset() {
    if (!this.store.isUnchanged()) {
      this.store.requestResetProposals();
    } else {
      this.store.uploadSchedulesShifts();
    }
  }

  onOpenPDF() {
    if (!this.store.isUnchanged()) {
      this.store.requestGetPdf();
    } else {
      this.store.getPdf();
    }
  }

  onToggleCalendar(event: MouseEvent) {
    event.stopPropagation();
    this.store.toggleCalendar();
  }
}