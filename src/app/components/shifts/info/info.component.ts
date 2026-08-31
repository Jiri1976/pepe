import { Component, inject, input } from '@angular/core';
import { ShiftsStore } from '../../../stores/shifts-store/shifts.store';
import { ShiftCard } from '../../../models/shifts.interface';
import { convertMonthYear } from '../../../helpers/common-functions.helper';
import { environment } from '../../../../environments/environment';
import { AuthStore } from '../../../stores/auth-store/auth.store';

@Component({
  selector: 'app-info',
  imports: [],
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class InfoComponent {
  readonly shiftsStore = inject(ShiftsStore);
  readonly authStore = inject(AuthStore);
  card = input.required<ShiftCard>();
  convertMonthYear = convertMonthYear;
  readonly apiUrl = environment.apiUrl;
}
