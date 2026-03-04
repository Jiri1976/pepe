import { CommonModule } from '@angular/common';
import { Component, inject, input, Input, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { ShiftsStore } from '../../stores/shifts-store/shifts.store';
import { isFridayOrSaturday, setTime } from '../../helpers/common-functions.helper';

@Component({
  selector: 'app-date-picker',
  imports: [CommonModule, DatePickerModule, FormsModule],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
})
export class DatePickerComponent {
  readonly store = inject(ShiftsStore);
  @Input({ required: true }) formField!: () => any;
  @Input({ required: true }) date!: string;
  minDate = input<Date>();
  maxDate = input<Date>();
  picker = viewChild<DatePicker>('datePicker');

  value: Date | null = null;

  ngOnInit() {
    const v = this.formField().value();
    this.value = v ? new Date(v) : null;
  }

  open() {
    queueMicrotask(() => this.picker()?.showOverlay());
  }

  onChange(v: Date | null) {
    if (!v) return;
    const formattedDate = ((v.getDate() > 9) ? v.getDate() : ('0' + v.getDate())) + '.' + ((v.getMonth() > 8) ? (v.getMonth() + 1) : ('0' + (v.getMonth() + 1))) + '.' + v.getFullYear()
    this.formField().value.set(formattedDate);
    this.store.shiftModel.set({
      date: formattedDate,
      from: setTime('11:00', formattedDate),
      to: setTime(isFridayOrSaturday(formattedDate) ? '23:00' : '22:00', formattedDate),
      perso: ''
    });
  }
}