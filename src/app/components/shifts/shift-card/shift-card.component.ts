import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, input, InputSignal, model, output, signal } from '@angular/core';
import { concatMap, of, tap } from 'rxjs';
import { InitShift } from '../../../models/shifts/initShift.interface';
import { Shift } from '../../../models/shifts/shift.interface';
import { UserDTO } from '../../../models/users/userDTO.interface';
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
  imports: [ShiftFormComponent],
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
  private initialShift: InitShift = {
    id: 0,
    date: new Date(),
    from: new Date(),
    to: new Date(),
    perso: ''
  };
  visibleModal = model<boolean>(false);
  loggedUser = this.authService.getUser();
  cardLoading = signal(false);
  // shiftCard: InputSignal<ShiftCard> = input.required();
  shiftCard = model<ShiftCard>();
  formVisible = signal(false);
  closeShiftForm = output<boolean>();
  openShiftForm = output();
  updatedCard = output<ShiftCard>();


  ngOnInit() {
    let date = new Date();
    let month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
    // this.shiftAdministartionCmp.getUserShifts(month + date.getFullYear().toString(), this.shiftAdministartionCmp.filteredUsers()[0]);
  }

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
    // this.shiftAdministartionCmp.shiftFormVisible.set(true);
  }

  onCloseShiftForm() {
    this.closeShiftForm.emit(true);
    this.formVisible.set(false);
  }

  onAddShift() {
    // this.selectCardId = card.id;
    // this.selectedUserId = card.userId;
    // this.selectedMonthYear = card.monthYear;
    this.formVisible.set(true);
    this.openShiftForm.emit();
    //this.shiftService.resetSelectedShift();
    // this.shiftAdministartionCmp.shiftFormVisible.set(true);
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
          // if (this.shiftCard().id === 0) {
          //   this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Kartu nelze smazat.' });
          // }
          // this.shiftAdministartionCmp.cardLoading.set(true);
          // let user = this.shiftAdministartionCmp.filteredUsers().filter(u => u.id === this.shiftCard().userId)[0];
          // const subscription = this.shiftService.deleteShiftCard(this.shiftCard().id).pipe(
          //   concatMap(response => {
          //     if (response.isSuccess) {

          //       return this.reloadShiftCard(this.shiftCard().monthYear, user);
          //     }
          //     return of();
          //   }),

          // ).subscribe({
          //   next: () => {
          //     this.shiftAdministartionCmp.cardLoading.set(false);
          //     this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: `Karta byla smazána!` });
          //   },
          //   error: error => this.handleError(error)
          // });

          // this.destroyRef.onDestroy(() => {
          //   subscription.unsubscribe();
          // });
        }
      });
  }

  onDeleteShift(date: string, shiftId: number, userId: number) {
    this.confirmService.confirm(`Opravdu chceš smazat směnu - ${date}?`)
      .then((confirmed) => {
        if (confirmed) {
          // this.shiftAdministartionCmp.cardLoading.set(true);
          // let user = this.shiftAdministartionCmp.filteredUsers().filter(u => u.id === userId)[0];
          // const subscription = this.shiftService.deleteShift(shiftId).pipe(
          //   concatMap(response => {
          //     if (response.isSuccess) {

          //       return this.reloadShiftCard(this.shiftCard().monthYear, user);
          //     }
          //     return of();
          //   }),

          // ).subscribe({
          //   next: () => {
          //     // this.shiftAdministartionCmp.cardLoading.set(false);
          //     this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: `Směna byla smazána!` });
          //   },
          //   error: error => this.handleError(error)
          // });

          // this.destroyRef.onDestroy(() => {
          //   subscription.unsubscribe();
          // });
        }
      });
  }

  onSave(shift: Shift) {
    this.cardLoading.set(true);
    shift.shiftCardId = this.shiftCard()!.id;
    shift.userId = this.shiftCard()!.userId;

    const subscription = this.shiftService.createUpdateShift(shift).pipe(
      concatMap(response => {
        if (response === null) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
          this.cardLoading.set(false);
        } else if (response.isSuccess === false) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
          this.cardLoading.set(false);
        } else if (response.isSuccess) {

          let _card: ShiftCard = response.result;
          // _card!.shifts.push(response.result);
          _card!.shifts.sort((a, b) => {
            return a.date.localeCompare(b.date);
          });
          this.shiftCard.set(_card);
          this.updatedCard.emit(_card);
          this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: 'Směna byla uložena!' });
        }
        return of();
      }),

    ).subscribe({
      next: () => {
        this.cardLoading.set(false);
        // this.isLoading = false;

        // this.persoError = false;
        // this.dateError = false;
        // this.fromError = false;
        // this.toError = false;
        // this.shiftForm.patchValue({
        //   'shiftDate': this.selectedShift().date,
        //   'shiftFrom': this.selectedShift().from,
        //   'shiftTo': this.selectedShift().to,
        //   'shiftPerso': this.selectedShift().perso
        // });
        // this.shiftForm.markAsUntouched();
        // this.cdr.detectChanges();
      },
      error: error => this.handleError(error)
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  // private reloadShiftCard(monthYear: string, user: UserDTO) {
  //   return this.shiftService.getUserShiftCard(monthYear, user).pipe(
  //     tap(response => {
  //       if (response !== null && response.isSuccess) {
  //         // this.shiftAdministartionCmp.shiftCard.set(response.result);
  //       }
  //     })
  //   );
  // }

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
    // this.shiftAdministartionCmp.cardLoading.set(false);
    return this.errorHandlingService.handleError(errorRes);
  };
}
