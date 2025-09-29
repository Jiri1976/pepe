import { DialogRef } from '@angular/cdk/dialog';
import { Component, computed, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProposalsService } from '../../../services/proposals.service';
import { ProposalUser } from '../../../models/proposals/proposalUser.interface';


@Component({
  selector: 'app-inactive-users',
  imports: [DialogModule, ButtonModule],
  templateUrl: './inactive-users.component.html',
  styleUrl: './inactive-users.component.scss'
})
export class InactiveUsersComponent {
  private proposalsService = inject(ProposalsService);
  private dialogRef = inject(DialogRef, { optional: true });
  users = computed(() => this.proposalsService.planCard()?.inactiveUsers);

  onSelectUser(user: ProposalUser, index: number) {
    this.proposalsService.addFromInactive(user, index);
    this.dialogRef?.close();
  }

  onClose() {
    this.dialogRef?.close();
  }
}
