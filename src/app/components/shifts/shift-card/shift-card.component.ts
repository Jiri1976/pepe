import { Component, DestroyRef, inject, input, model, OnInit, output, signal } from '@angular/core';
import { tap } from 'rxjs';
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
import { Dialog } from '@angular/cdk/dialog';

@Component({
  selector: 'app-shift-card',
  imports: [],
  templateUrl: './shift-card.component.html',
  styleUrl: './shift-card.component.scss',
  animations: [
    PageAnimation,
    FastPageAnimation
  ]
})
export class ShiftCardComponent implements OnInit {
  private shiftService = inject(ShiftService);
  private authService = inject(AuthService);
  private confirmService = inject(ConfirmService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  private shiftComponent = inject(ShiftsComponent);
  private dialog = inject(Dialog);
  loggedUser = this.authService.getUser();
  cardLoading = signal(false);
  updatedCard = output<ShiftCard>();
  pdfLoading = signal(false);
  currentIndex = input.required<number>();
  userCards = model<ShiftCard[]>();
  hasDriver = signal(false);
  hasCook = signal(false);
  firstCard = signal<string>('Cook');
  card = signal<ShiftCard | null>(null);

  ngOnInit() {
    this.hasDriver.set((this.userCards()!.filter(c => c.userPosition === 'Driver')).length > 0);
    this.hasCook.set((this.userCards()!.filter(c => c.userPosition === 'Cook')).length > 0);
    this.firstCard.set(this.userCards()![0].userPosition);
    this.card.set(this.userCards()![0]);
  }

  changeCard(position: string) {
    this.card.set(this.userCards()!.find(c => c.userPosition === position)!);
    this.shiftService.selectedCard.set(this.card());
    this.firstCard.set(position);
  }

  onUpdate(shift: Shift) {
    this.shiftService.setMonthYear(this.card()!.monthYear);
    this.shiftService.setSelectedShift(shift);
    this.dialog.open(ShiftFormComponent, { disableClose: false });
  }

  onDeleteCard() {
    this.confirmService.confirm(`Opravdu chceš smazat celou kartu?`)
      .then((confirmed) => {
        if (confirmed) {
          this.cardLoading.set(true);
          const subscription = this.shiftService.deleteShiftCard(this.card()!.id).pipe(
            tap(response => {
              if (response === null) {
                this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
                this.cardLoading.set(false);
              } else if (response.isSuccess === false) {
                this.cardLoading.set(false);
                this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
              } else if (response.isSuccess) {
                let _uniqueUsers = [...this.shiftService.uniqueUsers()];
                let user = _uniqueUsers.find(u => u.userId === this.card()!.userId);
                let card = user?.cards.find(c => c.userPosition === this.card()!.userPosition);
                card!.totalHours = "00:00";
                card!.shifts = [];
                this.shiftService.uniqueUsers.set(_uniqueUsers);
                this.shiftService.selectedCard.set(card!);
                this.shiftService.checkAllToPdf();
                this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: 'Karta byla smazána!' });
                this.cardLoading.set(false);
              }
            }),

          ).subscribe({
            next: () => { },
            error: () => {
              this.cardLoading?.set(false);
            }
          });

          this.destroyRef.onDestroy(() => {
            subscription.unsubscribe();
          });
        }
      });
  }

  onToPdf() {
    this.pdfLoading.set(true);
    const subscription = this.shiftService.generatePDF(this.card()!, this.shiftComponent.destination()).pipe(
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
          a.download = `${this.card()?.userName} ${this.card()?.userSurname} - ${this.convertMonthYear(this.card()!.monthYear)} - ${this.card()!.destination}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        }
      })
    ).subscribe({
      error: () => {
        this.pdfLoading.set(false);
      }
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  isPastCard() {
    let currentDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    let cardDate = new Date(parseInt(this.card()!.monthYear.substring(2, 6)), parseInt(this.card()!.monthYear.substring(0, 2)) - 1, 1);
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
