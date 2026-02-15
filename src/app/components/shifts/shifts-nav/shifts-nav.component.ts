import { Component, effect, ElementRef, inject, ViewChild } from '@angular/core';
import { HideElementDirective } from '../../../directives/hide-element.directive';
import { HideWhenAdminDirective } from '../../../directives/hide-when-admin.directive';
import { Dialog } from '@angular/cdk/dialog';
import { SelectUserComponent } from '../select-user/select-user.component';
import { ShiftsStore } from '../../../stores/shifts-store/shifts.store';
import { ShiftFormComponent } from '../shift-form/shift-form.component';

@Component({
  selector: 'app-shifts-nav',
  imports: [HideElementDirective, HideWhenAdminDirective],
  templateUrl: './shifts-nav.component.html',
  styleUrl: './shifts-nav.component.scss'
})
export class ShiftsNavComponent {
  readonly store = inject(ShiftsStore);
  private dialog = inject(Dialog)
  @ViewChild('toggleBtn', { static: true })
  toggleBtn!: ElementRef<HTMLElement>;

  constructor() {
    effect(() => {
      if (!this.store.isAddShiftDialogRequested()) return;
      if (this.dialog.openDialogs.length > 0) return;

      this.dialog.open(ShiftFormComponent, { disableClose: false })
        .closed.subscribe(() => {
          this.store.clearAddShiftDialogRequest();
        });
    });
  }

  openModal() {
    this.dialog.open(SelectUserComponent, { disableClose: false });
  }

  onToggleCalendar(event: MouseEvent) {
    event.stopPropagation();
    this.store.toggleCalendar();
  }

  changeDestination(destination: 'F-M' | 'OVA') {
    if (destination !== this.store.destination()) {
      this.store.setDestination(destination);
    }
    return;
  }
}