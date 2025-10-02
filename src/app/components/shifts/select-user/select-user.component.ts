import { Component, computed, inject, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DialogRef } from '@angular/cdk/dialog';
import { ShiftService } from '../../../services/shift.service';

@Component({
  selector: 'app-select-user',
  imports: [DialogModule, ButtonModule],
  templateUrl: './select-user.component.html',
  styleUrl: './select-user.component.scss'
})
export class SelectUserComponent {
  private shiftService = inject(ShiftService);
  private dialogRef = inject(DialogRef, { optional: true });
  users = computed(() => this.shiftService.users());

  onSelectUser(userId: number) {
    this.shiftService.selectedUserId.set(userId);
    this.dialogRef?.close();
  }

  onClose() {
    this.dialogRef?.close();
  }

  sectionStyles = signal<any>({
    'width': '25rem',
    'maxHeight': '500px',
    'overflow-y': this.users()!.length > 11 ? 'auto' : 'hidden'
  });
}
