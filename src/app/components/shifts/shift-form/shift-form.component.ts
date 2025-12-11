import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, computed, DestroyRef, effect, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ShiftService } from '../../../services/shift.service';
import { ConfirmService } from '../../../services/confirm.service';
import { Shift } from '../../../models/shifts/shift.interface';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { OverlayModule } from 'primeng/overlay';
import { DialogRef } from '@angular/cdk/dialog';
import { tap } from 'rxjs';
import { ToasterService } from '../../../services/toaster.service';
import { AuthStore } from '../../../stores/auth-store/auth.store';

@Component({
  selector: 'app-shift-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    FormsModule,
    DatePickerModule,
    TextareaModule,
    FloatLabelModule,
    DatePickerModule,
    OverlayModule,
    DatePicker
  ],
  templateUrl: './shift-form.component.html',
  styleUrl: './shift-form.component.scss'
})
export class ShiftFormComponent implements OnInit, AfterViewInit {
  readonly authStore = inject(AuthStore);
  private shiftService = inject(ShiftService);
  private confirmService = inject(ConfirmService);
  private dialogRef = inject(DialogRef, { optional: true });
  private toaster = inject(ToasterService);
  private destroyRef = inject(DestroyRef);
  private cdRef = inject(ChangeDetectorRef);
  shiftForm!: FormGroup;
  selectedShift = computed(() => this.shiftService.selectedShift());
  card = computed(() => this.shiftService.selectedCard());
  persoError = false;
  dateError = false;
  fromError = false;
  toError = false;
  calendarFocus = signal(false);
  fromIsOpen = signal(false);
  toIsOpen = signal(false);
  oldAndNewValuesAreSame = true;
  monthYear = computed(() => this.shiftService.monthYear());
  minDate = this.getMinDate(this.monthYear()!);
  maxDate = new Date();
  loading = signal(false);
  loadingText = signal('');
  userName = signal<string>('');
  calendar = viewChild<DatePicker>('calendar');
  timeFrom = viewChild<DatePicker>('timeFrom');
  timeTo = viewChild<DatePicker>('timeTo');
  perso = viewChild<ElementRef>('perso');

  constructor() {
    effect(() => {
      if (this.isPastCard()) {
        this.maxDate = this.getMaxDate(this.monthYear());
      }
      this.shiftForm.patchValue({
        'id': this.selectedShift().id,
        'shiftDate': this.selectedShift().date,
        'shiftFrom': this.selectedShift().from,
        'shiftTo': this.selectedShift().to,
        'shiftPerso': this.selectedShift().perso
      });
      this.shiftForm.markAsUntouched();
    })
  }

  ngOnInit(): void {
    this.initializedShitForm();
    this.userName.set(`${this.shiftService.selectedCard()!.userName} ${this.shiftService.selectedCard()!.userSurname}`);
  }

  ngAfterViewInit() {
    this.calendar()?.cd.detectChanges();
    this.calendar()?.hideOverlay();
    this.cdRef.detectChanges();
  }

  onDelete() {
    this.shiftForm.disable();
    let date = new Date(this.shiftForm.get('shiftDate')?.value).toLocaleString("cs-CZ", { dateStyle: 'medium' });
    this.confirmService.confirm(`Opravdu chceš smazat směnu z ${date}?`)
      .then((confirmed) => {
        if (confirmed) {
          this.loading.set(true);
          let shift = this.convertToShift();
          this.loadingText.set('Odtraňuji směnu ...');
          const subscription = this.shiftService.deleteShift(shift.id).pipe(
            tap(response => {
              if (response === null) {
                this.toaster.error('Něco se pokazilo, zkus to znovu.');
                this.loading.set(false);
              } else if (response.isSuccess === false) {
                this.loading.set(false);
                this.toaster.error(response.errorMessage);
              } else if (response.isSuccess) {
                let _uniqueUsers = [...this.shiftService.uniqueUsers()];
                let user = _uniqueUsers.find(u => u.userId === this.card()!.userId);
                let card = user?.cards.find(c => c.userPosition === this.card()!.userPosition);
                card!.shifts = card!.shifts.filter(s => s.id !== shift.id);
                card!.totalHours = response.result.totalHours;
                this.shiftService.uniqueUsers.set(_uniqueUsers);
                this.shiftService.selectedCard.set(response.result);
                this.shiftService.checkAllToPdf()
                this.loading.set(false);
                this.toaster.success('Směna byla smazána!');
                this.dialogRef!.close();
              }
            }),

          ).subscribe({
            next: () => { },
            error: () => {
              this.loading.set(false);
            }
          });

          this.destroyRef.onDestroy(() => {
            subscription.unsubscribe();
          });
        } else {
          return;
        }
      });
  }

  onOpenCalendar() {
    if (this.calendar) {
      this.calendar()?.showOverlay();
      this.calendar()?.cd.detectChanges();
    }
  }

  onOpenFrom() {
    if (this.timeFrom) {
      this.timeFrom()?.showOverlay();
      this.timeFrom()?.cd.detectChanges();
    }
  }

  onOpenTo() {
    if (this.timeTo) {
      this.timeTo()?.showOverlay();
      this.timeTo()?.cd.detectChanges();
    }
  }

  onHideForm() {
    if (this.loading()) {
      return;
    }
    this.dialogRef?.close();
  }

  onBlur(el: 'calendar' | 'from' | 'to') {
    if (el === 'calendar') {
      if (this.calendar()?.value === null) {
        this.dateError = true;
        this.calendarFocus.set(false);
        return;
      }
      this.refreshTimeTo(this.calendar()?.value);
      this.calendarFocus.set(false);
      this.dateError = false;
      this.compareOldAndNewValues();
      return;
    }

    if (el === 'from') {
      this.fromIsOpen.set(true)
      if (this.timeFrom()?.value === null) {
        this.fromError = true;
        return;
      }
      if (this.timeFrom()?.value > this.timeTo()?.value) {
        this.fromError = true;
        return;
      }
      this.fromError = false;
      this.compareOldAndNewValues();
      if (this.timeTo()?.isValidDate(this.timeTo()?.value) && this.toError) {
        this.toError = false;
      }
      return;
    }

    if (el === 'to') {
      this.toIsOpen.set(true);
      if (this.timeTo()?.value === null) {
        this.toError = true;
        return;
      }
      if (this.timeFrom()?.value > this.timeTo()?.value) {
        this.toError = true;
        return;
      }
      this.toError = false;
      this.compareOldAndNewValues();
      if (this.timeFrom()?.isValidDate(this.timeFrom()?.value) && this.fromError) {
        this.fromError = false;
      }
      return;
    }
  }

  onInput(el: 'calendar' | 'from' | 'to') {
    if (el === 'calendar') {
      if (this.calendar()?.value === null) {
        this.dateError = true;
        return;
      }

      if (!this.calendar()?.isValidDate(this.calendar()?.value)) {
        this.dateError = true;
        return;
      } else {
        this.refreshTimeTo(this.calendar()?.value);
        this.dateError = false;
        this.compareOldAndNewValues();
        return;
      }
    }
    if (el === 'from') {
      this.fromIsOpen.set(false);
      this.timeFrom()?.hideOverlay();
      if (this.timeFrom()?.value === null) {
        this.fromError = true;
        return;
      }
      if (!this.timeFrom()?.isValidDate(this.timeFrom()?.value)) {
        this.fromError = true;
        return;
      } else {
        if (this.timeFrom()?.value > this.timeTo()?.value) {
          this.fromError = true;
          return;
        }
        this.compareOldAndNewValues();
        this.fromError = false;
        if (this.timeTo()?.isValidDate(this.timeTo()?.value) && this.toError) {
          this.toError = false;
        }
        return;
      }
    }
    if (el === 'to') {
      this.toIsOpen.set(false);
      this.timeTo()?.hideOverlay();
      if (this.timeTo()?.value === null) {
        this.toError = true;
        return;
      }
      if (!this.timeTo()?.isValidDate(this.timeTo()?.value)) {
        this.toError = true;
        return;
      } else {
        if (this.timeFrom()?.value > this.timeTo()?.value) {
          this.toError = true;
          return;
        }
        this.compareOldAndNewValues();
        if (this.timeFrom()?.isValidDate(this.timeFrom()?.value) && this.fromError) {
          this.fromError = false;
        }
        this.toError = false;
        return;
      }
    }
  }

  checkPerso() {
    let text = this.perso()?.nativeElement.value;
    if (text.length > 100) {
      this.persoError = true;
    } else {
      this.compareOldAndNewValues();
      this.persoError = false;
    }
  }

  compareTimes() {
    if (this.oldAndNewValuesAreSame) {
      return true;
    }
    return ((new Date(this.timeFrom()?.value).getHours() === new Date(this.timeTo()?.value).getHours())
      && (new Date(this.timeFrom()?.value).getMinutes() === new Date(this.timeTo()?.value).getMinutes()));
  }

  getTime(date: string) {
    let _date = date.split('T')[0];
    let time = date.split('T')[1].substring(0, 5);
    return `${_date.split('-')[2]}.${_date.split('-')[1]}.${_date.split('-')[0]} ${time}`;
  }

  onSave() {
    let shift = this.convertToShift();
    this.shiftForm.disable();
    this.loadingText.set(this.selectedShift().id > 0 ? 'Upravuji směnu ...' : 'Ukládám směnu ...');
    this.loading.set(true);
    shift.shiftCardId = this.card()!.id;
    shift.userId = this.card()!.userId; 0
    const subscription = this.shiftService.createUpdateShift(shift).pipe(
      tap(response => {
        if (response === null) {
          this.toaster.error('Něco se pokazilo, zkus to znovu.');
          this.loading.set(false);
          this.shiftForm.enable();
        } else if (response.isSuccess === false) {
          this.loading.set(false);
          this.shiftForm.enable();
          this.toaster.error(response.errorMessage);
        } else if (response.isSuccess) {
          this.loading.set(false);
          let _uniqueUsers = [...this.shiftService.uniqueUsers()];
          let user = _uniqueUsers.find(u => u.userId === shift.userId);
          let card = user?.cards.find(c => c.userPosition === this.card()!.userPosition);
          if (card!.id === 0) {
            card!.id = response.result.id;
          }
          card!.shifts = response.result.shifts;
          card!.totalHours = response.result.totalHours;
          this.shiftService.uniqueUsers.set(_uniqueUsers);
          this.shiftService.selectedCard.set(response.result);
          this.shiftService.checkAllToPdf()
          this.toaster.success('Směna byla uložena!');
          this.dialogRef?.close();
        }
      }),

    ).subscribe({
      next: () => {
      },
      error: () => {
        this.loading?.set(false);
      }
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  private refreshTimeTo(date: string) {
    let calendarDay = new Date(date);
    let day = calendarDay.getDate() < 10 ? '0' + calendarDay.getDate() : calendarDay.getDate();
    let month = (calendarDay.getMonth() + 1) < 10 ? '0' + (calendarDay.getMonth() + 1) : (calendarDay.getMonth() + 1);
    let year = calendarDay.getFullYear();

    if (this.isFridayOrSaturday(date)) {
      this.shiftForm.patchValue({
        'shiftTo': new Date(year, parseInt(month.toString()) - 1, parseInt(day.toString()), 23, 0)
      });
    } else {
      this.shiftForm.patchValue({
        'shiftTo': new Date(year, parseInt(month.toString()) - 1, parseInt(day.toString()), 22, 0)
      });
    }
  }

  private isFridayOrSaturday(date: string) {
    var day = new Date(date);
    if (day.getDay() == 5 || day.getDay() == 6) {
      return true;
    }
    return false;
  }

  private convertToShift() {
    let hoursFrom = new Date(this.timeFrom()?.value).getHours() < 10 ? '0' + new Date(this.timeFrom()?.value).getHours() : new Date(this.timeFrom()?.value).getHours();
    let minutesFrom = new Date(this.timeFrom()?.value).getMinutes() < 10 ? '0' + new Date(this.timeFrom()?.value).getMinutes() : new Date(this.timeFrom()?.value).getMinutes();
    let hoursTo = new Date(this.timeTo()?.value).getHours() < 10 ? '0' + new Date(this.timeTo()?.value).getHours() : new Date(this.timeTo()?.value).getHours();
    let minutesTo = new Date(this.timeTo()?.value).getMinutes() < 10 ? '0' + new Date(this.timeTo()?.value).getMinutes() : new Date(this.timeTo()?.value).getMinutes();
    let calendarDay = new Date(this.calendar()?.value);
    let day = calendarDay.getDate() < 10 ? '0' + calendarDay.getDate() : calendarDay.getDate();
    let month = (calendarDay.getMonth() + 1) < 10 ? '0' + (calendarDay.getMonth() + 1) : (calendarDay.getMonth() + 1);
    let year = calendarDay.getFullYear();

    let initialShift = { ...this.selectedShift() };
    let shift: Shift = {
      id: initialShift.id,
      shiftCardId: 0,
      userId: 0,
      position: this.selectedShift().position,
      destination: this.selectedShift().destination,
      date: day + '.' + month + '.' + year,
      from: hoursFrom.toString() + ':' + minutesFrom.toString(),
      to: hoursTo.toString() + ':' + minutesTo.toString(),
      hours: '',
      perso: this.shiftForm.get("shiftPerso")?.value
    }
    return shift;
  }

  private compareOldAndNewValues() {
    let monthFromSelectedShift = '' + (this.selectedShift().date.getMonth() + 1);
    let dayFromSelectedShift = '' + this.selectedShift().date.getDate();
    let yearFromSelectedShift = this.selectedShift().date.getFullYear();
    let hoursFromSelectedShift = '' + this.selectedShift().from.getHours();
    let minutesFromSelectedShift = '' + this.selectedShift().from.getMinutes();
    let hoursToSelectedShift = '' + this.selectedShift().to.getHours();
    let minutesToSelectedShift = '' + this.selectedShift().to.getMinutes();

    if (monthFromSelectedShift.length < 2) {
      monthFromSelectedShift = '0' + monthFromSelectedShift;
    }
    if (dayFromSelectedShift.length < 2) {
      dayFromSelectedShift = '0' + dayFromSelectedShift;
    }

    if (hoursFromSelectedShift.length < 2) {
      hoursFromSelectedShift = '0' + hoursFromSelectedShift;
    }
    if (minutesFromSelectedShift.length < 2) {
      minutesFromSelectedShift = '0' + minutesFromSelectedShift;
    }

    if (hoursToSelectedShift.length < 2) {
      hoursToSelectedShift = '0' + hoursToSelectedShift;
    }
    if (minutesToSelectedShift.length < 2) {
      minutesToSelectedShift = '0' + minutesToSelectedShift;
    }

    let hoursFrom = new Date(this.timeFrom()?.value).getHours() < 10 ? '0' + new Date(this.timeFrom()?.value).getHours() : new Date(this.timeFrom()?.value).getHours();
    let minutesFrom = new Date(this.timeFrom()?.value).getMinutes() < 10 ? '0' + new Date(this.timeFrom()?.value).getMinutes() : new Date(this.timeFrom()?.value).getMinutes();
    let hoursTo = new Date(this.timeTo()?.value).getHours() < 10 ? '0' + new Date(this.timeTo()?.value).getHours() : new Date(this.timeTo()?.value).getHours();
    let minutesTo = new Date(this.timeTo()?.value).getMinutes() < 10 ? '0' + new Date(this.timeTo()?.value).getMinutes() : new Date(this.timeTo()?.value).getMinutes();
    let calendarDay = new Date(this.calendar()?.value);
    let day = calendarDay.getDate() < 10 ? '0' + calendarDay.getDate() : calendarDay.getDate();
    let month = (calendarDay.getMonth() + 1) < 10 ? '0' + (calendarDay.getMonth() + 1) : (calendarDay.getMonth() + 1);
    let year = calendarDay.getFullYear();

    let selectedDate = [dayFromSelectedShift, monthFromSelectedShift, yearFromSelectedShift].join('.');
    let selectedFrom = [hoursFromSelectedShift, minutesFromSelectedShift].join(':');
    let selectedTo = [hoursToSelectedShift, minutesToSelectedShift].join(':');
    let selectedPerso = this.selectedShift().perso;

    let currentDate = day + '.' + month + '.' + year;
    let currentFrom = hoursFrom.toString() + ':' + minutesFrom.toString();
    let currentTo = hoursTo.toString() + ':' + minutesTo.toString();
    let currentPerso = this.perso()?.nativeElement.value;

    if (selectedDate === currentDate && selectedFrom === currentFrom && selectedTo === currentTo && selectedPerso === currentPerso) {
      this.shiftForm.markAsUntouched();
      this.oldAndNewValuesAreSame = true;
    } else {
      this.shiftForm.markAsTouched();
      this.oldAndNewValuesAreSame = false;
    }
  }

  private getMinDate(monthYear: string) {
    return new Date(parseInt(monthYear.substring(2, 6)), parseInt(monthYear.substring(0, 2)) - 1, 1);
  }

  private getMaxDate(monthYear: string) {
    return new Date(parseInt(monthYear.substring(2, 6)), parseInt(monthYear.substring(0, 2)), 0);
  }

  private isPastCard() {
    let currentDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    let cardDate = new Date(parseInt(this.monthYear().substring(2, 6)), parseInt(this.monthYear().substring(0, 2)) - 1, 1);
    if (cardDate < currentDate) {
      return true;
    }
    return false;
  }

  private initializedShitForm() {
    this.shiftForm = new FormGroup({
      'id': new FormControl({
        value: this.selectedShift().id,
        disabled: true
      }),
      'shiftDate': new FormControl({
        value: this.selectedShift().date,
        disabled: false
      }, [Validators.required]),
      'shiftFrom': new FormControl({
        value: this.selectedShift().from,
        disabled: false
      }, [Validators.required]),
      'shiftTo': new FormControl({
        value: this.selectedShift().to,
        disabled: false
      }, [Validators.required]),
      'shiftPerso': new FormControl({
        value: this.selectedShift().perso,
        disabled: false
      }, [Validators.required, Validators.maxLength(100)])
    });
  }
}