import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';
import { OverlayModule } from 'primeng/overlay';
import { DialogRef } from '@angular/cdk/dialog';
import { AuthStore } from '../../../stores/auth-store/auth.store';
import { ShiftsStore } from '../../../stores/shifts-store/shifts.store';
import { FormField, FieldState, form } from '@angular/forms/signals';
import { buildShift } from '../../../stores/shifts-store/shifts.helpers';
import { DPickerComponent } from '../../d-picker/d-picker.component';
import { HideElementDirective } from "../../../directives/hide-element.directive";
import { DatePickerComponent } from "../../date-picker/date-picker.component";

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
    FormField,
    DPickerComponent,
    HideElementDirective,
    DatePickerComponent
  ],
  templateUrl: './shift-form.component.html',
  styleUrl: './shift-form.component.scss'
})
export class ShiftFormComponent {
  readonly shiftsStore = inject(ShiftsStore);
  readonly authStore = inject(AuthStore);
  readonly MAX_PERSO = 100;
  private dialogRef = inject(DialogRef, { optional: true });
  selectedShift = this.shiftsStore.selectedShift;
  card = this.shiftsStore.currentCard;
  monthYear = this.shiftsStore.monthYear;
  minDate = this.getMinDate(this.shiftsStore.monthYear());
  maxDate = this.shiftsStore.isPastCard() ? this.getMaxDate(this.shiftsStore.monthYear()) : new Date();
  readonly form = form(this.shiftsStore.shiftModel, s => {
    buildShift(s);
  });

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

  getPosition(position: string) {
    switch (position) {
      case ('Helper'):
        return 'pomocka'.toUpperCase();
      case ('Driver'):
        return 'řiďič'.toUpperCase();
      case ('Cook'):
        return 'kuchař'.toUpperCase();
      case ('Pizza'):
        return 'pizzař'.toUpperCase();
      default:
        return '';
    }
  }

  onDelete() {
    this.shiftsStore.requestDeleteShift();
  }

  onHideForm() {
    if (this.shiftsStore.isSaving()) {
      return;
    }
    this.dialogRef?.close();
  }

  onPersoInput(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    this.form.perso().value.set(value);
  }

  getTime(date: string) {
    let _date = date.split('T')[0];
    let time = date.split('T')[1].substring(0, 5);
    return `${_date.split('-')[2]}.${_date.split('-')[1]}.${_date.split('-')[0]} ${time}`;
  }

  onSave() {
    let _shift = { ...this.selectedShift() };
    _shift.date = this.form.date().value();
    _shift.from = this.timeToString(this.form.from().value());
    _shift.to = this.timeToString(this.form.to().value());
    _shift.perso = this.form.perso().value();
    //this.shiftsStore.setSelectedShift(_shift);
    this.shiftsStore.createUpdateShift(_shift);
  }

  private timeToString(date: Date | null) {
    if (date === null) {
      return '';
    }
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const convertedHours = hours < 10 ? `0${hours}` : hours?.toString();
    const convertedMinutes = minutes < 10 ? `0${minutes}` : minutes?.toString()

    return `${convertedHours}:${convertedMinutes}`;
  }

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
    const s = this.selectedShift();
    if (!s) return null;

    return {
      date: s.date,
      from: s.from,
      to: s.to,
      perso: s.perso
    };
  });

  private getMinDate(monthYear: string) {
    return new Date(parseInt(monthYear.substring(2, 6)), parseInt(monthYear.substring(0, 2)) - 1, 1);
  }

  private getMaxDate(monthYear: string) {
    return new Date(parseInt(monthYear.substring(2, 6)), parseInt(monthYear.substring(0, 2)), 0);
  }

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