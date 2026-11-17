import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  inject,
  input,
  Input,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { ShiftsStore } from '../../stores/shifts-store/shifts.store';
import { isFridayOrSaturday, setTime } from '../../helpers/common-functions.helper';

@Component({
  selector: 'app-date-picker',
  imports: [CommonModule, DatePickerModule, FormsModule],
  host: {
    '[class.date-focused]': 'dateFocused()',
    '[class.calendar-open]': 'calendarOpen()',
  },
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
})
export class DatePickerComponent {
  readonly store = inject(ShiftsStore);
  @Input({ required: true }) formField!: () => any;
  @Input({ required: true }) date!: string;
  minDate = input<Date>();
  maxDate = input<Date>();
  panelStyleClass = input('shift-form-calendar-panel');
  picker = viewChild<DatePicker>('datePicker');
  touchUi = signal(false);
  dateFocused = signal(false);
  calendarOpen = signal(false);
  inputFocused = signal(false);

  value: Date | null = null;

  constructor() {
    this.updateTouchUi();
  }

  ngOnInit() {
    const v = this.formField().value();
    this.value = v ? new Date(v) : null;
  }

  open() {
    this.picker()?.inputfieldViewChild()?.nativeElement.focus();
    queueMicrotask(() => this.picker()?.showOverlay());
  }

  onInputFocus() {
    this.dateFocused.set(true);
  }

  onInputBlur() {
    this.dateFocused.set(false);
    this.formField().markAsTouched();
  }

  onPanelShow() {
    this.calendarOpen.set(true);
    this.dateFocused.set(true);
  }

  onPanelHide() {
    this.calendarOpen.set(false);
    this.dateFocused.set(false);
  }

  @HostListener('window:resize')
  protected updateTouchUi() {
    this.touchUi.set(window.matchMedia('(max-width: 690px)').matches);
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
