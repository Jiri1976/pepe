import { Component, computed, inject, model } from '@angular/core';
import { ShiftService } from '../../../services/shift.service';
import { ShiftsComponent } from '../../../pages/shifts/shifts.component';
import { HideElementDirective } from '../../../directives/hide-element.directive';
import { HideWhenAdminDirective } from '../../../directives/hide-when-admin.directive';
import { Dialog } from '@angular/cdk/dialog';
import { SelectUserComponent } from '../select-user/select-user.component';
import { AuthStore } from '../../../stores/auth-store/auth.store';

@Component({
  selector: 'app-shifts-nav',
  imports: [HideElementDirective, HideWhenAdminDirective],
  templateUrl: './shifts-nav.component.html',
  styleUrl: './shifts-nav.component.scss'
})
export class ShiftsNavComponent {
  readonly authStore = inject(AuthStore);
  private shiftService = inject(ShiftService);
  private dialog = inject(Dialog)
  shiftsComponent = inject(ShiftsComponent);
  calendarText = model('');
  destination = model('');
  pdfOn = model(false);
  pdfCards = computed(() => this.shiftService.pdfCards());

  openModal() {
    this.dialog.open(SelectUserComponent, { disableClose: false });
  }
}