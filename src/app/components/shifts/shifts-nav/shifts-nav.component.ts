import { Component, computed, inject, model } from '@angular/core';
import { ShiftService } from '../../../services/shift.service';
import { ShiftsComponent } from '../../../pages/shifts/shifts.component';
import { HideElementDirective } from '../../../directives/hide-element.directive';
import { AuthService } from '../../../services/auth.service';
import { HideWhenAdminDirective } from '../../../directives/hide-when-admin.directive';

@Component({
  selector: 'app-shifts-nav',
  imports: [HideElementDirective, HideWhenAdminDirective],
  templateUrl: './shifts-nav.component.html',
  styleUrl: './shifts-nav.component.scss'
})
export class ShiftsNavComponent {
  private shiftService = inject(ShiftService);
  private authService = inject(AuthService);
  shiftsComponent = inject(ShiftsComponent);
  calendarText = model('');
  destination = model('');
  pdfOn = model(false);
  loggedUser = this.authService.getUser();
  disabled = computed(() => this.shiftService.shiftFormVisible() || this.shiftsComponent.isLoading());
}
