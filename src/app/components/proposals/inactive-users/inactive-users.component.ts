import { DialogRef } from '@angular/cdk/dialog';
import { Component, computed, effect, EffectRef, ElementRef, inject, OnDestroy, viewChild } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProposalUser } from '../../../models/proposals/proposalUser.interface';
import { ProposalStore } from '../../../stores/proposal-store/proposal.store';

@Component({
  selector: 'app-inactive-users',
  imports: [DialogModule, ButtonModule],
  templateUrl: './inactive-users.component.html',
  styleUrl: './inactive-users.component.scss'
})
export class InactiveUsersComponent implements OnDestroy {
  readonly store = inject(ProposalStore);
  private dialogRef = inject(DialogRef, { optional: true });
  private effectRef!: EffectRef;
  scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  users = computed<ProposalUser[]>(() => {
    switch (this.store.selectedInactive()) {
      case 'Helper':
        return this.store.helpers();
      case 'Driver':
        return this.store.drivers();
      case 'Cook':
        return this.store.cooks();
      case 'Pizza':
        return this.store.pizza();
      default:
        return [];
    }
  });

  sectionStyles = computed(() => ({
    'width': '25rem',
    'maxHeight': '450px',
    'overflow-y': this.users()!.length > 10 ? 'auto' : 'hidden'
  }));


  constructor() {
    this.effectRef = effect(() => {
      const currentUsers = this.users();

      if (currentUsers.length === 0) {
        queueMicrotask(() => this.dialogRef?.close());
        return;
      }

      const el = this.scrollContainer();
      if (el) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.nativeElement.scrollTop = 0;
          });
        });
      }
    });
  }

  ngOnDestroy() {
    this.effectRef?.destroy();
  }

  protected onSelectUser(user: ProposalUser) {
    this.store.addFromInactive(user);
  }

  protected onClose() {
    this.dialogRef?.close();
  }
}