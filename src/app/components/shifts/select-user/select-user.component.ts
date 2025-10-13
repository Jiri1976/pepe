import { Component, computed, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
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
  uniqueUsers = computed(() => this.shiftService.uniqueUsers());
  scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  constructor() {
    effect(() => {
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

  sectionStyles = signal<any>({
    'width': '25rem',
    'maxHeight': '500px',
    'overflow-y': this.uniqueUsers()!.length > 11 ? 'auto' : 'hidden'
  });

  onSelectUser(userId: number) {
    this.shiftService.selectedUserId.set(userId);
    this.dialogRef?.close();
  }

  onClose() {
    this.dialogRef?.close();
  }
}
