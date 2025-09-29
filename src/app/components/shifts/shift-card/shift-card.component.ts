import { Component, computed, DestroyRef, inject, input, model, output, signal, ViewChild } from '@angular/core';
import { tap } from 'rxjs';
import { InitShift } from '../../../models/shifts/initShift.interface';
import { Shift } from '../../../models/shifts/shift.interface';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmService } from '../../../services/confirm.service';
import { ShiftService } from '../../../services/shift.service';
import { ShiftCard } from '../../../models/shifts/shiftCard.interface';
import { ShiftFormComponent } from "../shift-form/shift-form.component";
import { ShiftsComponent } from '../../../pages/shifts/shifts.component';
import { PageAnimation } from '../../../animations/page.animation';
import { FastPageAnimation } from '../../../animations/fast-page.animation';

@Component({
  selector: 'app-shift-card',
  imports: [ShiftFormComponent],
  templateUrl: './shift-card.component.html',
  styleUrl: './shift-card.component.scss',
  animations: [
    PageAnimation,
    FastPageAnimation
  ]
})
export class ShiftCardComponent {
  private shiftService = inject(ShiftService);
  private authService = inject(AuthService);
  private confirmService = inject(ConfirmService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  private shiftComponent = inject(ShiftsComponent);
  visibleModal = model<boolean>(false);
  loggedUser = this.authService.getUser();
  cardLoading = signal(false);
  shiftCard = model<ShiftCard>();
  formVisible = computed(() => this.shiftService.shiftFormVisible());
  updatedCard = output<ShiftCard>();
  pdfLoading = signal(false);
  currentIndex = input.required<number>();
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
      perso: shift.perso,
      position: shift.position,
      destination: shift.destination
    }
    this.shiftService.selectedShift.set(_shift);
  }

  onCloseShiftForm() {
    this.shiftService.shiftFormVisible.set(false);
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
                this.cardLoading.set(false);
                this.shiftComponent.currentIndex.set(this.currentIndex());
                this.shiftComponent.onReset();
                this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: 'Karta byla smazána!' });
              }
            }),

          ).subscribe({
            next: () => { },
            error: () => {
              this.cardLoading?.set(false);
              this.shiftFormComponent?.loading?.set(false);
            }
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
          this.shiftFormComponent.loading.set(false);
          this.shiftService.shiftFormVisible.set(false);
          this.shiftComponent.currentIndex.set(this.currentIndex());
          this.shiftComponent.onReset();
          this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: 'Směna byla smazána!' });
        }
      }),

    ).subscribe({
      next: () => { },
      error: () => {
        this.cardLoading?.set(false);
        this.shiftFormComponent?.loading?.set(false);
      }
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
          this.shiftFormComponent.loading.set(false);
          this.shiftService.shiftFormVisible.set(false);
          this.shiftComponent.currentIndex.set(this.currentIndex());
          this.shiftComponent.onReset();
          this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: 'Směna byla uložena!' });
        }
      }),

    ).subscribe({
      next: () => {
      },
      error: () => {
        this.cardLoading?.set(false);
        this.shiftFormComponent?.loading?.set(false);
      }
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  onToPdf() {
    this.pdfLoading.set(true);
    const subscription = this.shiftService.generatePDF(this.shiftCard()!, this.shiftComponent.destination()).pipe(
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
          a.download = `${this.shiftCard()?.userName} ${this.shiftCard()?.userSurname} - ${this.convertMonthYear(this.shiftCard()!.monthYear)} - ${this.shiftComponent.destination()}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        }
      })
    ).subscribe({
      error: () => {
        this.cardLoading?.set(false);
        this.shiftFormComponent?.loading?.set(false);
      }
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
}
