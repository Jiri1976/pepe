import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { CalendarAvailableDirective } from '../../directives/calendar-available.directive';

@Component({
  selector: 'app-calendar',
  imports: [DatePickerModule, DatePicker, FormsModule],
  hostDirectives: [
    {
      directive: CalendarAvailableDirective,
      inputs: ['isOpen', 'onClose'],
    },
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent {
  readonly date = input<Date | null>(null);
  readonly maxDate = input<Date | null>(null);
  readonly isOpen = input.required<() => boolean>();
  readonly onClose = input.required<() => void>();

  readonly dateChange = output<Date>();

  selectedDate = new Date();
  selectedYear = this.selectedDate.getFullYear();

  constructor() {
    effect(() => {
      const externalDate = this.date();
      if (!externalDate) {
        return;
      }

      this.selectedDate = new Date(externalDate);
      this.selectedYear = this.selectedDate.getFullYear();
    });
  }

  onMonthSelect(value: Date) {
    this.selectedDate = new Date(this.selectedYear, value.getMonth(), 1);
    this.dateChange.emit(this.selectedDate);
  }
}
