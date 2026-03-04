import { CommonModule } from '@angular/common';
import { Component, effect, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-d-picker',
  imports: [CommonModule, DatePickerModule, FormsModule],
  templateUrl: './d-picker.component.html',
  styleUrl: './d-picker.component.scss',
})
export class DPickerComponent {
  @Input({ required: true }) formField!: () => any;
  @Input({ required: true }) proposalDate!: string;
  value: Date | null = null;

  constructor() {
    effect(() => {
      const fieldValue = this.formField().value();

      if (!fieldValue && !this.value) return;

      if (
        fieldValue &&
        this.value &&
        fieldValue.getHours() === this.value.getHours() &&
        fieldValue.getMinutes() === this.value.getMinutes()
      ) {
        return;
      }

      this.value = fieldValue ? new Date(fieldValue) : null;
    });
  }

  onChange(v: Date | null) {
    if (!v) {
      this.value = null;
      this.formField().value.set(null);
      return;
    }

    const current = this.formField().value();
    const baseDate = this.parseDate(this.proposalDate);

    const merged = new Date(baseDate);
    merged.setHours(v.getHours(), v.getMinutes() ?? 0, 0, 0);

    if (
      current &&
      current.getHours() === merged.getHours() &&
      current.getMinutes() === merged.getMinutes()
    ) {
      return;
    }

    this.formField().value.set(merged);
  }

  private parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('.').map(Number);

    return new Date(
      year,
      month - 1,
      day,
      0, 0, 0, 0
    );
  }
}
