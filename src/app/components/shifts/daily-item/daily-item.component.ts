import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { User } from '../../../models/users.interface';
import { buildShift } from '../../../stores/shifts-store/shifts.helpers';
import { ShiftsStore } from '../../../stores/shifts-store/shifts.store';
import { FieldState, form } from '@angular/forms/signals';
import { getPosition, setTime, timeToString, todayDate } from '../../../helpers/common-functions.helper';
import { DPickerComponent } from "../../d-picker/d-picker.component";
import { Shift, ShiftModel } from "../../../models/shifts.interface";
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-daily-item',
  imports: [DPickerComponent, TitleCasePipe],
  templateUrl: './daily-item.component.html',
  styleUrl: './daily-item.component.scss',
})
export class DailyItemComponent {
  readonly shiftsStore = inject(ShiftsStore);
  private timeToString = timeToString;
  getPosition = getPosition;
  todayDate = todayDate();
  index = input.required<number>();
  shift = input.required<Shift>();
  user = signal<User | null>(null);
  positions = computed(() => {
    const positionSet = new Set<string>();
    if (this.user()) {
      this.user()!.destinations.filter(dest => dest.destination === this.shift()?.destination)[0].positions!.forEach(pos => positionSet.add(pos.position!));
    };
    return Array.from(positionSet);
  });
  sameUserAndShiftError = signal('');
  shiftModel = signal<ShiftModel>({
    date: '',
    from: null,
    to: null,
    perso: ''
  });

  readonly form = form(this.shiftModel, s => {
    buildShift(s);
  });

  constructor() {
    effect(() => {
      const currentShift = this.shift();
      const user = this.shiftsStore.todaysShifts.users().find(u => u.id === currentShift?.userId);
      this.user.set(user ?? null);
    });
  }

  ngOnInit() {
    this.shiftModel.set({
      date: this.todayDate,
      from: setTime(this.shift().from!, this.todayDate),
      to: setTime(this.shift().to!, this.todayDate),
      perso: ''
    });
  }

  onPersoInput(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    this.form.perso().value.set(value);
  }

  onSelectUser(event: any) {
    this.shiftsStore.clearConcurrentErrors();
    const userId = event.target.value;
    this.sameUserAndShiftError.set('');
    if (userId === '0') {
      this.user.set(null);
      this.shiftsStore.updateDailyShiftUserId(this.index(), 0);
      this.checkForConcurrent();
      return;
    }

    const user = this.shiftsStore.todaysShifts.users().find(u => u.id === +userId);
    if (user) {
      this.user.set(user);
      this.shiftsStore.updateDailyShiftUserId(this.index(), +userId);
      this.shiftsStore.updateDailyShiftPosition(this.index(), '');
      this.checkForConcurrent();
    }
  }

  onSelectPosition(event: any) {
    const position = event.target.value;
    if (position === '0') {
      this.sameUserAndShiftError.set('');
      this.shiftsStore.updateDailyShiftPosition(this.index(), '');
      return;
    }
    let sameUserAndShift = this.shiftsStore.todaysShifts.shifts().find(s => s.userId === this.user()?.id && s.position === position);
    if (sameUserAndShift) {
      this.sameUserAndShiftError.set('Už existuje');
      return;
    }
    this.sameUserAndShiftError.set('');
    this.shiftsStore.updateDailyShiftPosition(this.index(), position);
    this.updateShift();
  }

  removeShift(index: number) {
    if (this.shiftsStore.todaysShifts().shifts[index].id === 0 && this.shiftsStore.todaysShifts().shifts[index].confirmed === undefined) {
      this.shiftsStore.removeUnsavedTodaysShifts(index);
      this.checkForConcurrent();
    }
    else if ((this.shiftsStore.todaysShifts().shifts[index].id === 0 && this.shiftsStore.todaysShifts().shifts[index].confirmed !== undefined) || (this.shiftsStore.todaysShifts().shifts[index].id > 0)) {
      const user = this.shiftsStore.todaysShifts.users().find(u => u.id === this.shiftsStore.todaysShifts().shifts[index].userId);
      const message = `Smazat rozpis pro ${user?.name} ${user?.surname} - ${getPosition(this.shiftsStore.todaysShifts().shifts[index].position).toLowerCase()}?`;
      this.shiftsStore.setSelectedDailyIndex(this.index());
      this.shiftsStore.requestDeleteDailyShift(this.shift(), message);
    }
    return;
  }

  submitShift() {
    if (this.form().invalid()) {
      return;
    }
    this.shiftsStore.setSelectedDailyIndex(this.index());
    this.shiftsStore.createUpdateDailyShift(this.shift());
  }

  updateShift() {
    const values = this.form().value();
    this.shiftsStore.updateDailyShift(this.index(), this.timeToString(values.from), this.timeToString(values.to));
    this.checkForConcurrent();
  }

  checkForConcurrent() {
    const shifts = this.shiftsStore.todaysShifts.shifts();
    let failedIndex = -1;

    if (shifts.length > 1) {
      for (let i = 0; i < shifts.length - 1; i++) {
        let shf = shifts[i];
        if (shf.userId === 0 && shf.position === '') {
          continue;
        }
        for (let j = i + 1; j < shifts.length; j++) {
          let other = shifts[j];
          if (shf.userId === other.userId && failedIndex === -1) {
            if (shf.from === other.from && shf.to === other.to) {
              this.shiftsStore.updateConcurrentErrors(i);
              this.shiftsStore.updateConcurrentErrors(j);
              failedIndex = i;
            }

            const inputFrom = parseFloat(shf.from!.replace(':', ''));
            const inputTo = parseFloat(shf.to!.replace(':', ''));
            const listedFrom = parseFloat(other.from!.replace(':', ''));
            const listedTo = parseFloat(other.to!.replace(':', ''));

            if ((listedFrom > inputFrom && listedFrom < inputTo) || (listedTo > inputFrom && listedTo < inputTo) || (inputFrom >= listedFrom && inputTo <= listedTo)) {
              failedIndex = i;
              this.shiftsStore.updateConcurrentErrors(i);
              this.shiftsStore.updateConcurrentErrors(j);
            }
          }
        }
      }
    }
    if (failedIndex === -1) {
      this.shiftsStore.clearConcurrentErrors();
    }
  }

  readonly isUnchanged = computed(() => {
    const original = this.originalShift();
    const current = this.formSnapshot();

    if (!original) return true;

    return (
      original.date === current.date &&
      original.from === current.from &&
      original.to === current.to &&
      original.perso === current.perso
    );
  });

  private formSnapshot = computed(() => {
    const v = this.form().value();

    const formattedFrom = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    }).format(v.from!);

    const formattedTo = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    }).format(v.to!);

    return {
      date: v.date,
      from: formattedFrom,
      to: formattedTo,
      perso: v.perso
    };
  });

  private originalShift = computed(() => {
    const s = this.shift();
    if (!s) return null;

    return {
      date: s.date,
      from: s.from,
      to: s.to,
      perso: s.perso
    };
  });

  protected showPersoError = computed(() =>
    this.form.perso().invalid());

  protected showTimeFromError = computed(() =>
    this.setShowError(this.form.from()));

  protected showTimeToError = computed(() =>
    this.setShowError(this.form.to()));

  private setShowError(field: FieldState<Date | string | null>) {
    return field.invalid() || field.dirty();
  }
}