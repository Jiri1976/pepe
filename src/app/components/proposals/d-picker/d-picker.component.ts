import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-d-picker',
  imports: [CommonModule, DatePickerModule, FormsModule],
  templateUrl: './d-picker.component.html',
  styleUrl: './d-picker.component.scss',
})
export class DPickerComponent implements OnInit {
  @Input({ required: true }) field!: () => any;
  @Input({ required: true }) proposalDate!: string;

  value: Date | null = null;

  ngOnInit() {
    const v = this.field().value();
    this.value = v ? new Date(v) : null;
  }

  onChange(v: Date | null) {
    if (!v) return;

    const current = this.field().value();
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

    this.field().value.set(merged);
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
