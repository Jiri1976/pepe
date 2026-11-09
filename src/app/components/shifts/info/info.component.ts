import { Component, inject, input } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { ShiftsStore } from '../../../stores/shifts-store/shifts.store';
import { ShiftCard } from '../../../models/shifts.interface';
import { convertMonthYear } from '../../../helpers/common-functions.helper';
import { environment } from '../../../../environments/environment';
import { AuthStore } from '../../../stores/auth-store/auth.store';
import { ConfirmationComponent } from '../../confirmation/confirmation.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-info',
  imports: [],
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class InfoComponent {
  private dialog = inject(Dialog);
  readonly shiftsStore = inject(ShiftsStore);
  readonly authStore = inject(AuthStore);
  card = input.required<ShiftCard>();
  convertMonthYear = convertMonthYear;
  readonly apiUrl = environment.apiUrl;

  async deleteCard() {
    const dialogRef = this.dialog.open<boolean>(ConfirmationComponent, {
      disableClose: false,
      data: { text: 'Opravdu chceš smazat kartu?' },
    });
    const result = await firstValueFrom(dialogRef.closed);

    if (result !== true) {
      return;
    }

    this.shiftsStore.deleteCard();
  }
}
