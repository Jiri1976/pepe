import { Component, computed, inject } from '@angular/core';
import { ShiftsStore } from '../../../stores/shifts-store/shifts.store';
import { convertMonthYear } from '../../../helpers/common-functions.helper';
import { AuthStore } from '../../../stores/auth-store/auth.store';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-shift-header',
  imports: [],
  templateUrl: './shift-header.component.html',
  styleUrl: './shift-header.component.scss',
})
export class ShiftHeaderComponent {
  readonly authStore = inject(AuthStore);
  readonly shiftsStore = inject(ShiftsStore);
  readonly apiUrl = environment.apiUrl;
  card = this.shiftsStore.currentCard;
  convertMonthYear = convertMonthYear;

  emptyPositions = computed(() => {
    return new Array(4 - this.shiftsStore.currentPositions().length);
  });
}
