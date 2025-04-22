import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, output, ViewChild } from '@angular/core';
import { WarehouseService } from '../../services/warehouse.service';
import { AlertService } from '../../services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CalendarModule } from 'primeng/calendar';
import { OverlayModule } from 'primeng/overlay';
import { SpinnerComponent } from "../spinner/spinner.component";
import { WarehouseUnit } from '../../models/warehouse/warehouse-unit.interface';
import { FormsModule } from '@angular/forms';
import { ErrorHandlingService } from '../../services/error-handling.service';
import { tap } from 'rxjs';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-admin-warehouse',
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
    OverlayModule,
    SpinnerComponent,
    FormsModule,
    DatePickerModule
  ],
  templateUrl: './admin-warehouse.component.html',
  styleUrl: './admin-warehouse.component.scss'
})
export class AdminWarehouseComponent {
  private warehouseService = inject(WarehouseService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  private errorHandlingService = inject(ErrorHandlingService);
  private months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

  items = computed(() => this.warehouseService.items());
  selectedList = 1;
  selectedDestination: 'F-M' | 'OVA' = 'F-M';
  moveIndex = 'translateX(70px)';
  _checkIndex = this.items() ? 'translateX(' + (this.items().length + 1) * 70 + 'px)' : 'translateX(70px)';
  _width = this.items() ? (this.items().length + 2) * 70 + 'px' : '70px';
  loading = false;
  defaultDate: Date = new Date(new Date().getFullYear(), new Date().getMonth());
  monthYear = this.months[new Date().getMonth()] + '-' + new Date().getFullYear();
  checkSelected = output<boolean>();
  outputUnit = output<void>();
  warehouseCard = computed(() => this.warehouseService.warehouseCard());
  @ViewChild('calendar', { static: false }) calendar!: DatePicker;

  constructor() {
    effect(() => {
      this._checkIndex = this.items() ? 'translateX(' + (this.items().length + 1) * 70 + 'px)' : 'translateX(70px)';
      this._width = this.items() ? (this.items().length + 2) * 70 + 'px' : '70px';
      this.moveIndex = 'translateX(70px)';
      if (this.items() && this.items().length > 0) {
        this.selectedList = 1;
        const _monthYear = this.monthYear.split('-')[0] + this.monthYear.split('-')[1];
        this.getWarehouseCard(_monthYear, this.selectedDestination, this.items()[this.selectedList - 1].id);
      }
    });
  }

  onChangeDestination() {
    if (this.items() === null || this.items().length === 0) {
      this.alertService.setAlert({ severity: 'warn', summary: 'Warn', detail: 'Zadej aspoň jednu položku.' });
      return;
    }
    if (this.selectedDestination === 'F-M') {
      this.selectedDestination = 'OVA';
    } else {
      this.selectedDestination = 'F-M';
    }
    const _monthYear = this.monthYear.split('-')[0] + this.monthYear.split('-')[1];
    this.getWarehouseCard(_monthYear, this.selectedDestination, this.items()[this.selectedList - 1].id)
  }

  onShowCalendar() {
    this.calendar.showOverlay();
    this.calendar.cd.detectChanges();
  }

  onSelectList(item: number) {
    this.selectedList = item;
    this.moveIndex = 'translateX(' + 70 * item + 'px)';
    const _monthYear = this.monthYear.split('-')[0] + this.monthYear.split('-')[1];
    this.getWarehouseCard(_monthYear, this.selectedDestination, this.items()[this.selectedList - 1].id)
  }

  onSelectMonth() {
    if (this.items() === null || this.items().length === 0) {
      this.alertService.setAlert({ severity: 'warn', summary: 'Warn', detail: 'Zadej aspoň jednu položku.' });
      return;
    }
    this.monthYear = this.months[new Date(this.calendar.value).getMonth()] + '-' + new Date(this.calendar.value).getFullYear();
    const _monthYear = this.monthYear.split('-')[0] + this.monthYear.split('-')[1];
    this.getWarehouseCard(_monthYear, this.selectedDestination, this.items()[this.selectedList - 1].id);
  }

  onAddWarehouseItem() {
    this.checkSelected.emit(true);
  }

  onSelectUnit(unit: WarehouseUnit) {
    this.warehouseService.setSelectedUnit(unit);
    this.outputUnit.emit();
  }

  checkDate(date: string) {
    let _date = new Date(parseInt(date.split('.')[2]), parseInt(date.split('.')[1]) - 1, parseInt(date.split('.')[0]));
    if (_date > new Date()) {
      return false;
    }
    return true;
  }

  getWarehouseCard(monthYear: string, destination: string, warehouseItemId: number) {
    this.loading = true;
    const subscription = this.warehouseService.getWarehouseCard(monthYear, destination, warehouseItemId).pipe(
      tap(response => {
        this.loading = false;
        if (response === null) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
        } else if (response.isSuccess === false) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else {
          this.warehouseService.setWarehouseCard(response.result);
        }
      }),
      tap({
        error: error => this.handleError(error)
      })
    ).subscribe();

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  private handleError = (errorRes: HttpErrorResponse) => {
    this.loading = false;
    return this.errorHandlingService.handleError(errorRes);
  };
}
