import { Component, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DialogRef } from '@angular/cdk/dialog';
import { ShiftsStore } from '../../../stores/shifts-store/shifts.store';

@Component({
  selector: 'app-select-user',
  imports: [DialogModule, ButtonModule],
  templateUrl: './select-user.component.html',
  styleUrl: './select-user.component.scss'
})
export class SelectUserComponent {
  readonly store = inject(ShiftsStore);
  private dialogRef = inject(DialogRef, { optional: true });
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
    'overflow-y': this.store.uniqueUsers()!.length > 11 ? 'auto' : 'hidden'
  });

  onSelectUser(userId: number) {
    let index = this.store.uniqueUsers().findIndex(u => u.userId === userId);
    this.store.slideTo(index);
    this.dialogRef?.close();
  }

  onClose() {
    this.dialogRef?.close();
  }
}
