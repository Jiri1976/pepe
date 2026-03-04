import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, inject, viewChild } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { WarehouseNavComponent } from "../../components/warehouse/warehouse-nav/warehouse-nav.component";
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { WarehouseStore } from '../../stores/warehouse-store/warehouse.store';
import { MONTHS_NUM } from '../../helpers/common-constants.helper';

@Component({
  selector: 'app-warehouse',
  imports: [
    DialogModule,
    ButtonModule,
    DatePicker,
    DatePickerModule,
    InputTextModule,
    WarehouseNavComponent,
    FormsModule,
    RouterOutlet
  ],
  templateUrl: './warehouse.component.html',
  styleUrl: './warehouse.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WarehouseComponent {
  readonly store = inject(WarehouseStore);
  destination = this.store.destination();
  calendar = viewChild<DatePicker>('calendar');

  constructor() {
    effect(() => {
      if (this.calendar) {
        if (!this.store.showCalendar()) {
          this.calendar()?.hideOverlay();
          this.calendar()?.cd.detectChanges();
        } else {
          this.calendar()?.showOverlay();
          this.calendar()?.cd.detectChanges();
        }
      }
    });
  }

  onSelectMonth() {
    let _monthYear = MONTHS_NUM[this.calendar()?.value.getMonth()] + this.calendar()?.value.getFullYear();
    this.store.setMonthYear(_monthYear);
  }

  onCalendarClickOutside(event: MouseEvent, toggleBtn: HTMLElement) {
    const target = event.target as HTMLElement;
    if (toggleBtn.contains(target)) {
      return;
    }
    this.store.closeCalendar();
  }
}