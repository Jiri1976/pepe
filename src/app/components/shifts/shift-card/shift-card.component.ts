import { Component, computed, inject } from '@angular/core';
import { Shift } from '../../../models/shifts/shift.interface';
import { AuthStore } from '../../../stores/auth-store/auth.store';
import { ShiftsStore } from '../../../stores/shifts-store/shifts.store';
import { convertMonthYear } from '../../../helpers/common-functions.helper';

@Component({
  selector: 'app-shift-card',
  imports: [],
  templateUrl: './shift-card.component.html',
  styleUrl: './shift-card.component.scss'
})
export class ShiftCardComponent {
  readonly authStore = inject(AuthStore);
  readonly shiftsStore = inject(ShiftsStore);
  convertMonthYear = convertMonthYear;
  userCards = this.shiftsStore.userCards;
  card = this.shiftsStore.currentCard;
  sectionStyles = computed(() => {
    if (this.card()?.shifts && this.card()!.shifts?.length > 29) {
      return {
        'overflow-y': 'scroll'
      }
    } else {
      return {
        'overflow-y': 'hidden'
      }
    }
  });

  onUpdate(shift: Shift) {
    this.shiftsStore.updateShift(shift);
  }

  isPastCard() {
    let currentDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    let cardDate = new Date(parseInt(this.card()!.monthYear.substring(2, 6)), parseInt(this.card()!.monthYear.substring(0, 2)) - 1, 1);
    if (cardDate < currentDate) {
      return true;
    }
    return false;
  }
}