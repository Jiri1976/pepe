import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, model, output, signal } from '@angular/core';
import { of, tap } from 'rxjs';
import { InitShift } from '../../../models/shifts/initShift.interface';
import { Shift } from '../../../models/shifts/shift.interface';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmService } from '../../../services/confirm.service';
import { ErrorHandlingService } from '../../../services/error-handling.service';
import { ShiftService } from '../../../services/shift.service';
import { SpinnerComponent } from '../../spinner/spinner.component';
import { ShiftCard } from '../../../models/shifts/shiftCard.interface';
import { ShiftFormComponent } from "../shift-form/shift-form.component";

@Component({
  selector: 'app-shift-card',
  imports: [ShiftFormComponent, SpinnerComponent],
  templateUrl: './shift-card.component.html',
  styleUrl: './shift-card.component.scss'
})
export class ShiftCardComponent {
  private shiftService = inject(ShiftService);
  private authService = inject(AuthService);
  private confirmService = inject(ConfirmService);
  private errorHandlingService = inject(ErrorHandlingService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  visibleModal = model<boolean>(false);
  loggedUser = this.authService.getUser();
  cardLoading = signal(false);
  shiftCard = model<ShiftCard>();
  formVisible = signal(false);
  closeShiftForm = output<boolean>();
  openShiftForm = output();
  updatedCard = output<ShiftCard>();

  onUpdateShift(shift: Shift) {
    let date = new Date(parseInt(shift.date.split('.')[2]), parseInt(shift.date.split('.')[1]) - 1, parseInt(shift.date.split('.')[0]));
    let from = new Date(parseInt(shift.date.split('.')[2]), parseInt(shift.date.split('.')[1]) - 1, parseInt(shift.date.split('.')[0]), parseInt(shift.from?.split(':')[0]!), parseInt(shift.from?.split(':')[1]!));
    let to = new Date(parseInt(shift.date.split('.')[2]), parseInt(shift.date.split('.')[1]) - 1, parseInt(shift.date.split('.')[0]), parseInt(shift.to?.split(':')[0]!), parseInt(shift.to?.split(':')[1]!));
    let _shift: InitShift = {
      id: shift.id,
      date: date,
      from: from,
      to: to,
      perso: shift.perso
    }
    this.shiftService.selectedShift.set(_shift);
  }

  onCloseShiftForm() {
    this.closeShiftForm.emit(true);
    this.formVisible.set(false);
  }

  onAddShift() {
    this.formVisible.set(true);
    this.openShiftForm.emit();
  }

  onUpdate(shift: Shift) {
    this.shiftService.setSelectedShift(shift);
    this.formVisible.set(true);
    this.openShiftForm.emit();
  }

  onDeleteCard() {
    this.confirmService.confirm(`Opravdu chceš smazat celou kartu?`)
      .then((confirmed) => {
        if (confirmed) {

        }
      });
  }

  onDeleteShift(shift: Shift) {
    this.cardLoading.set(true);
    const subscription = this.shiftService.deleteShift(shift.id).pipe(
      tap(response => {
        if (response === null) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
          this.cardLoading.set(false);
          this.shiftService.setSelectedShift(shift);
          this.formVisible.set(true);
          this.openShiftForm.emit();
        } else if (response.isSuccess === false) {
          this.cardLoading.set(false);
          this.shiftService.setSelectedShift(shift);
          this.formVisible.set(true);
          this.openShiftForm.emit();
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else if (response.isSuccess) {
          this.shiftService.resetSelectedShift();
          let _card: ShiftCard = response.result;
          _card!.shifts.sort((a, b) => {
            return a.date.localeCompare(b.date);
          });
          this.shiftCard.set(_card);
          this.updatedCard.emit(_card);
          this.cardLoading.set(false);
          this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: 'Směna byla smazána!' });
        }
      }),

    ).subscribe({
      next: () => {

      },
      error: error => this.handleError(error)
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  onSave(shift: Shift) {
    this.cardLoading.set(true);
    shift.shiftCardId = this.shiftCard()!.id;
    shift.userId = this.shiftCard()!.userId;

    const subscription = this.shiftService.createUpdateShift(shift).pipe(
      tap(response => {
        if (response === null) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
          this.cardLoading.set(false);
          this.shiftService.setSelectedShift(shift);
          this.formVisible.set(true);
          this.openShiftForm.emit();
        } else if (response.isSuccess === false) {
          this.cardLoading.set(false);
          this.shiftService.setSelectedShift(shift);
          this.formVisible.set(true);
          this.openShiftForm.emit();
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else if (response.isSuccess) {

          let _card: ShiftCard = response.result;
          _card!.shifts.sort((a, b) => {
            return a.date.localeCompare(b.date);
          });
          this.shiftCard.set(_card);
          this.updatedCard.emit(_card);
          this.cardLoading.set(false);
          this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: 'Směna byla uložena!' });
        }
        return of();
      }),

    ).subscribe({
      next: () => {
      },
      error: error => this.handleError(error)
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  isPastCard() {
    let currentDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    let cardDate = new Date(parseInt(this.shiftCard()!.monthYear.substring(2, 6)), parseInt(this.shiftCard()!.monthYear.substring(0, 2)) - 1, 1);
    if (cardDate < currentDate) {
      return true;
    }
    return false;
  }

  convertMonthYear(monthYear: string) {
    let month = monthYear.substring(0, 2);
    let year = monthYear.substring(2, 6);
    let converted = '';

    switch (month) {
      case '01':
        converted = 'Leden ' + year;
        break;
      case '02':
        converted = 'Únor ' + year;
        break;
      case '03':
        converted = 'Březen ' + year;
        break;
      case '04':
        converted = 'Duben ' + year;
        break;
      case '05':
        converted = 'Květen ' + year;
        break;
      case '06':
        converted = 'Červen ' + year;
        break;
      case '07':
        converted = 'Červenec ' + year;
        break;
      case '08':
        converted = 'Srpen ' + year;
        break;
      case '09':
        converted = 'Září ' + year;
        break;
      case '10':
        converted = 'Říjen ' + year;
        break;
      case '11':
        converted = 'Listopad ' + year;
        break;
      case '12':
        converted = 'Prosinec ' + year;
        break;
      default:
        converted = '' + year;
        break;
    }

    return converted;
  }

  private handleError = (errorRes: HttpErrorResponse) => {
    return this.errorHandlingService.handleError(errorRes);
  };
}
