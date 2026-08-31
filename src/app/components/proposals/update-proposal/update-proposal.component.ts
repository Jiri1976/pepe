import { Component, computed, inject, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogRef } from '@angular/cdk/dialog';
import { ProposalStore } from '../../../stores/proposal-store/proposal.store';
import { FormField, FieldState, form } from '@angular/forms/signals';
import { buildProposal } from '../../../stores/proposal-store/proposal.helpers';
import { isFridayOrSaturday } from '../../../helpers/common-functions.helper';
import { DPickerComponent } from '../../d-picker/d-picker.component';

@Component({
  selector: 'app-update-proposal',
  imports: [
    DialogModule,
    ButtonModule,
    DatePickerModule,
    FormField,
    DPickerComponent,
  ],
  templateUrl: './update-proposal.component.html',
  styleUrl: './update-proposal.component.scss',
})
export class UpdateProposalComponent {
  readonly store = inject(ProposalStore);
  private dialogRef = inject(DialogRef, { optional: true });
  isFridayOrSaturday = isFridayOrSaturday;
  selectedProposal = this.store.selectedProposal;
  errorMessage = signal<string | null>(null);

  readonly form = form(this.store.proposalModel, (s) => {
    buildProposal(s);
  });

  readonly position = computed<string>(() => {
    switch (this.store.selectedProposal()?.position) {
      case 'Helper':
        return 'pomocka';
      case 'Driver':
        return 'řidič';
      case 'Cook':
        return 'kuchyň';
      case 'Pizza':
        return 'pizzař';
      default:
        return '';
    }
  });

  onClearErrorMessage() {
    this.errorMessage.set(null);
  }

  onUpdate(shiftType?: string) {
    const inputs = this.checkInputTimes(shiftType);
    const selected = this.selectedProposal();
    if (!selected) {
      return;
    }

    const shifts = this.store
      .schedules()
      .flatMap((c) => c.users)
      .flatMap((u) => u.shifts)
      .filter(
        (s) =>
          s.proposalDate === selected.proposalDate &&
          s.userId === selected.userId &&
          s.from !== null &&
          s.to !== null &&
          !(
            s.destination === selected.destination &&
            s.position === selected.position
          ),
      );

    if (!shifts || shifts.length === 0) {
      this.store.updateProposal(inputs);
      this.onClose();
    } else {
      let selectedShift = { ...this.store.selectedProposal() };
      selectedShift.from = `${inputs.hoursFrom}:${inputs.minutesFrom}`;
      selectedShift.to = `${inputs.hoursTo}:${inputs.minutesTo}`;

      let isColliding = false;
      shifts?.forEach((shift) => {
        if (
          this.collideShifts(
            selectedShift.from!,
            selectedShift.to!,
            shift.from!,
            shift.to!,
          )
        ) {
          isColliding = true;
          this.errorMessage.set(
            `POZOR: Směna ${shift.destination} - ${shift.from} - ${shift.to}`,
          );
          return;
        }
      });
      if (!isColliding) {
        this.store.updateProposal(inputs);
        this.onClose();
      }
    }
  }

  collideShifts(
    inputShiftFrom: string,
    inputShiftTo: string,
    timeFrom: string,
    timeTo: string,
  ) {
    // timeFrom = timeFrom === 'OVA' || timeFrom === 'F-M' ? '11:00' : timeFrom;

    if (timeFrom === 'OVA' || timeFrom === 'F-M') {
      return false;
    }

    if (
      inputShiftFrom === '11:00' &&
      (inputShiftTo === '22:00' || inputShiftTo === '23:00')
    ) {
      return true;
    }

    if (inputShiftFrom === timeFrom && inputShiftTo === timeTo) {
      return true;
    }

    const inputFrom = parseFloat(inputShiftFrom.replace(':', ''));
    const inputTo = parseFloat(inputShiftTo.replace(':', ''));
    const listedFrom = parseFloat(timeFrom.replace(':', ''));
    const listedTo = parseFloat(timeTo.replace(':', ''));

    if (
      (listedFrom > inputFrom && listedFrom < inputTo) ||
      (listedTo > inputFrom && listedTo < inputTo) ||
      (inputFrom >= listedFrom && inputTo <= listedTo)
    ) {
      return true;
    }
    return false;
  }

  onDelete() {
    const selected = this.selectedProposal();
    if (!selected) {
      return;
    }

    if (selected.from === 'F-M' || selected.from === 'OVA') {
      this.errorMessage.set(
        `Směnu odstraníš na kartě - ${this.store.destination() === 'F-M' ? 'OVA' : 'F-M'}.`,
      );
      return;
    }
    this.store.deleteProposal();
    this.onClose();
  }

  onClose() {
    this.dialogRef?.close();
  }

  private checkInputTimes(shiftType?: string) {
    let isFridaySaturday =
      this.form().value().timeFrom?.getDay() == 5 ||
      this.form().value().timeFrom?.getDay() == 6;
    let hoursFrom =
      new Date(this.form().value().timeFrom!).getHours() < 10
        ? '0' + new Date(this.form().value().timeFrom!).getHours()
        : new Date(this.form().value().timeFrom!).getHours();
    let minutesFrom =
      new Date(this.form().value().timeFrom!).getMinutes() < 10
        ? '0' + new Date(this.form().value().timeFrom!).getMinutes()
        : new Date(this.form().value().timeFrom!).getMinutes();
    let hoursTo =
      new Date(this.form().value().timeTo!).getHours() < 10
        ? '0' + new Date(this.form().value().timeTo!).getHours()
        : new Date(this.form().value().timeTo!).getHours();
    let minutesTo =
      new Date(this.form().value().timeTo!).getMinutes() < 10
        ? '0' + new Date(this.form().value().timeTo!).getMinutes()
        : new Date(this.form().value().timeTo!).getMinutes();

    if (shiftType === 'W') {
      hoursFrom = '11';
      minutesFrom = '00';
      hoursTo = isFridaySaturday ? '23' : '22';
      minutesTo = '00';
    } else if (shiftType === 'M') {
      hoursFrom = '11';
      minutesFrom = '00';
      hoursTo = '17';
      minutesTo = '00';
    } else if (shiftType === 'A') {
      hoursFrom = '17';
      minutesFrom = '00';
      hoursTo = isFridaySaturday ? '23' : '22';
      minutesTo = '00';
    }
    return { hoursFrom, minutesFrom, hoursTo, minutesTo };
  }

  protected showTimeFromError = computed(() =>
    this.setShowError(this.form.timeFrom()),
  );

  protected showTimeToError = computed(() =>
    this.setShowError(this.form.timeTo()),
  );

  private setShowError(field: FieldState<Date | null>) {
    return field.invalid();
  }
}
