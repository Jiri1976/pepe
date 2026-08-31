import { Component, inject } from '@angular/core';
import { Shift } from '../../../models/shifts.interface';
import { AuthStore } from '../../../stores/auth-store/auth.store';
import { ShiftsStore } from '../../../stores/shifts-store/shifts.store';
import { InfoComponent } from '../info/info.component';

@Component({
  selector: 'app-shift-card',
  imports: [InfoComponent],
  templateUrl: './shift-card.component.html',
  styleUrls: ['./shift-card.component.scss'],
})
export class ShiftCardComponent {
  readonly authStore = inject(AuthStore);
  readonly shiftsStore = inject(ShiftsStore);
  userCards = this.shiftsStore.userCards;
  card = this.shiftsStore.currentCard;

  onUpdate(shift: Shift) {
    this.shiftsStore.updateShift(shift);
  }

  isPastCard() {
    let currentDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );
    let cardDate = new Date(
      parseInt(this.card()!.monthYear.substring(2, 6)),
      parseInt(this.card()!.monthYear.substring(0, 2)) - 1,
      1,
    );
    if (cardDate < currentDate) {
      return true;
    }
    return false;
  }

  getCardPosition() {
    switch (this.shiftsStore.selectedCardPosition()) {
      case 'Driver':
        return 'řidiče';
      case 'Helper':
        return 'pomocky';
      case 'Cook':
        return 'kuchaře';
      case 'Pizza':
        return 'pizzaře';
      default:
        return '';
    }
  }
}
