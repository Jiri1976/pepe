import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, model, output, signal, ViewChild } from '@angular/core';
import { of, tap } from 'rxjs';
import { InitShift } from '../../../models/shifts/initShift.interface';
import { Shift } from '../../../models/shifts/shift.interface';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmService } from '../../../services/confirm.service';
import { ErrorHandlingService } from '../../../services/error-handling.service';
import { ShiftService } from '../../../services/shift.service';
import { ShiftCard } from '../../../models/shifts/shiftCard.interface';
import { ShiftFormComponent } from "../shift-form/shift-form.component";
import { trigger, transition, animate, style } from '@angular/animations';

@Component({
  selector: 'app-shift-card',
  imports: [ShiftFormComponent],
  templateUrl: './shift-card.component.html',
  styleUrl: './shift-card.component.scss',
  animations: [
    trigger('fadeOut', [
      transition(':leave', [
        animate('500ms ease-out', style({ opacity: 0 })),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-in', style({ opacity: 1 })),
      ])
    ]),
  ]
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
  formVisible = computed(() => this.shiftService.shiftFormVisible());
  updatedCard = output<ShiftCard>();
  pdfLoading = signal(false);
  @ViewChild(ShiftFormComponent) shiftFormComponent: any;

  onUpdateShift(shift: Shift) {
    this.shiftService.setMonthYear(this.shiftCard()!.monthYear);
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
    this.shiftService.shiftFormVisible.set(false);
  }

  onAddShift() {
    this.shiftService.setMonthYear(this.shiftCard()!.monthYear);
    let _shift: Shift = {
      id: 0,
      shiftCardId: this.shiftCard()!.id,
      userId: this.shiftCard()!.userId,
      date: '',
      from: '11:00',
      to: '22:00',
      hours: '',
      perso: ''
    }

    if (this.isPastCard()) {
      _shift.date = `01.${this.shiftCard()!.monthYear.substring(0, 2)}.${this.shiftCard()!.monthYear.substring(2, 6)}`;
    } else {
      let day = new Date().getDate() < 10 ? '0' + new Date().getDate() : (new Date().getDate()).toString();
      _shift.date = `${day}.${this.shiftCard()!.monthYear.substring(0, 2)}.${this.shiftCard()!.monthYear.substring(2, 6)}`;
      _shift.to = this.isFridayOrSaturday(_shift.date) ? '23:00' : '22:00';
    }
    this.shiftService.setSelectedShift(_shift);
    this.shiftService.shiftFormVisible.set(true);
  }

  onUpdate(shift: Shift) {
    this.shiftService.setMonthYear(this.shiftCard()!.monthYear);
    this.shiftService.setSelectedShift(shift);
    this.shiftService.shiftFormVisible.set(true);
  }

  onDeleteCard() {
    this.confirmService.confirm(`Opravdu chceš smazat celou kartu?`)
      .then((confirmed) => {
        if (confirmed) {
          this.cardLoading.set(true);
          const subscription = this.shiftService.deleteShiftCard(this.shiftCard()!.id).pipe(
            tap(response => {
              if (response === null) {
                this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
                this.cardLoading.set(false);
              } else if (response.isSuccess === false) {
                this.cardLoading.set(false);
                this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
              } else if (response.isSuccess) {
                let _card: ShiftCard = response.result;
                this.shiftCard.set(_card);
                this.updatedCard.emit(_card);
                this.cardLoading.set(false);
                this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: 'Karta byla smazána!' });
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
      });
  }

  onDeleteShift(shift: Shift) {
    this.shiftFormComponent.loading.set(true);
    const subscription = this.shiftService.deleteShift(shift.id).pipe(
      tap(response => {
        if (response === null) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
          this.shiftFormComponent.loading.set(false);
          this.shiftService.setSelectedShift(shift);
          this.shiftFormComponent.shiftForm.enable();
        } else if (response.isSuccess === false) {
          this.shiftFormComponent.loading.set(false);
          this.shiftService.setSelectedShift(shift);
          this.shiftFormComponent.shiftForm.enable();
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else if (response.isSuccess) {
          let _card: ShiftCard = response.result;
          _card!.shifts.sort((a, b) => {
            return a.date.localeCompare(b.date);
          });
          this.shiftCard.set(_card);
          this.updatedCard.emit(_card);
          this.shiftFormComponent.loading.set(false);
          this.shiftService.shiftFormVisible.set(false);
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
    this.shiftFormComponent.loading.set(true);
    shift.shiftCardId = this.shiftCard()!.id;
    shift.userId = this.shiftCard()!.userId; 0
    const subscription = this.shiftService.createUpdateShift(shift).pipe(
      tap(response => {
        if (response === null) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
          this.shiftFormComponent.loading.set(false);
          this.shiftService.setSelectedShift(shift);
          this.shiftFormComponent.shiftForm.enable();
        } else if (response.isSuccess === false) {
          this.shiftFormComponent.loading.set(false);
          this.shiftService.setSelectedShift(shift);
          this.shiftFormComponent.shiftForm.enable();
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else if (response.isSuccess) {
          let _card: ShiftCard = response.result;
          _card!.shifts.sort((a, b) => {
            return a.date.localeCompare(b.date);
          });
          this.shiftCard.set(_card);
          this.updatedCard.emit(_card);
          this.shiftFormComponent.loading.set(false);
          this.shiftService.shiftFormVisible.set(false);
          this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: 'Směna byla uložena!' });
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

  onToPdf() {
    this.pdfLoading.set(true);
    const subscription = this.shiftService.generatePDF(this.shiftCard()!).pipe(
      tap(response => {
        if (response === null) {
          this.pdfLoading.set(false);
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
        } else if (response.isSuccess === false) {
          this.pdfLoading.set(false);
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else {
          this.pdfLoading.set(false);
          const binary = atob(response.result);
          const uint8Array = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            uint8Array[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([uint8Array], { type: 'application/pdf' });
          var url = window.URL.createObjectURL(blob);
          const a = document.createElement('a')
          a.href = url;
          a.download = `${this.shiftCard()?.user} - ${this.convertMonthYear(this.shiftCard()!.monthYear)}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        }
      })
    ).subscribe({
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

  private isFridayOrSaturday(date: string) {
    var day = new Date(parseInt(date.split('.')[2]), parseInt(date.split('.')[1]) - 1, parseInt(date.split('.')[0]));
    if (day.getDay() == 5 || day.getDay() == 6) {
      return true;
    }
    return false;
  }


  private handleError = (errorRes: HttpErrorResponse) => {
    this.cardLoading?.set(false);
    this.shiftFormComponent?.loading?.set(false);
    return this.errorHandlingService.handleError(errorRes);
  };
}
