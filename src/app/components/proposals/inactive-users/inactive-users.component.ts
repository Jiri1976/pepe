import { DialogRef } from '@angular/cdk/dialog';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProposalsService } from '../../../services/proposals.service';
import { ProposalUser } from '../../../models/proposals/proposalUser.interface';

interface UniqueUser {
  user: ProposalUser;
  roles: string[];
}

@Component({
  selector: 'app-inactive-users',
  imports: [DialogModule, ButtonModule],
  templateUrl: './inactive-users.component.html',
  styleUrl: './inactive-users.component.scss'
})
export class InactiveUsersComponent implements OnInit {
  private proposalsService = inject(ProposalsService);
  private dialogRef = inject(DialogRef, { optional: true });
  users = computed(() => this.proposalsService.schedules().find(c => c.destination === this.proposalsService.destination())!.inactiveUsers);
  uniqueUsers: UniqueUser[] = [];

  ngOnInit() {
    this.filterUsers();
  }

  sectionStyles = signal<any>({
    'width': '25rem',
    'maxHeight': '500px',
    'overflow-y': this.users()!.length > 11 ? 'auto' : 'hidden'
  });

  protected onSelectUser(user: ProposalUser, role: string) {
    let _users = [...this.users()!]
    let _user = _users.find(x => x.id === user.id && x.position === role);
    let selectedUserIndex = _users.indexOf(_user!);
    this.proposalsService.addFromInactive(_user!, selectedUserIndex!);
    this.dialogRef?.close();
  }

  protected onClose() {
    this.dialogRef?.close();
  }

  private filterUsers() {
    this.users()!.forEach((user) => {
      let isListed = false;
      let isListedIndex = -1;
      this.uniqueUsers.forEach((uni, index) => {
        if (user.id === uni.user.id) {
          isListed = true;
          isListedIndex = index;
        }
      });

      if (isListed) {
        this.uniqueUsers[isListedIndex].roles.push(user.position);
      } else {
        this.uniqueUsers.push({
          user, roles: [user.position]
        });
      }
    });
  }
}
