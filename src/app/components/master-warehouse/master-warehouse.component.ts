import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, effect, inject, output } from '@angular/core';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { WarehouseService } from '../../services/warehouse.service';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from "../spinner/spinner.component";
import { WarehouseUnit } from '../../models/warehouse/warehouse-unit.interface';
import { ErrorHandlingService } from '../../services/error-handling.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-master-warehouse',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './master-warehouse.component.html',
  styleUrl: './master-warehouse.component.scss'
})
export class MasterWarehouseComponent {
  private warehouseService = inject(WarehouseService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);
  private errorHandlingService = inject(ErrorHandlingService);
  private months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

  units = [];
  selectedList = 0;
  moveIndex = '';
  _width = (this.units.length) * 70 + 'px';
  isLoading = false;
  items = computed(() => this.warehouseService.items());
  monthYear = this.months[new Date().getMonth()] + '-' + new Date().getFullYear();
  warehouseCard = computed(() => this.warehouseService.warehouseCard());
  outputUnit = output<void>();
  destination = this.authService.getUser().destination;;
  cardIsLoading = false;

  constructor() {
    effect(() => {
      this._width = this.items() ? (this.items().length) * 70 + 'px' : '70px';
      this.moveIndex = '';
      if (this.items() && this.items().length > 0) {
        this.selectedList = 0;
        const _monthYear = this.monthYear.split('-')[0] + this.monthYear.split('-')[1];
        this.getWarehouseCard(_monthYear, this.destination, this.items()[this.selectedList].id);
      }
    });
  }

  onSelectList(item: number) {
    this.selectedList = item;
    this.moveIndex = 'translateX(' + 70 * item + 'px)';
    const _monthYear = this.monthYear.split('-')[0] + this.monthYear.split('-')[1];
    this.getWarehouseCard(_monthYear, this.destination, this.items()[this.selectedList].id);
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

  private getWarehouseCard(monthYear: string, destination: string, warehouseItemId: number) {
    this.cardIsLoading = true;
    const subscription = this.warehouseService.getWarehouseCard(monthYear, destination, warehouseItemId).pipe(
      tap(response => {
        this.isLoading = false;
        this.cardIsLoading = false;
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
    this.isLoading = false;
    return this.errorHandlingService.handleError(errorRes);
  };
}
