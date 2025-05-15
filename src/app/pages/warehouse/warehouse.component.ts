import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, inject, model, signal, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { WarehouseService } from '../../services/warehouse.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '../../services/alert.service';
import { tap } from 'rxjs';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { ErrorHandlingService } from '../../services/error-handling.service';
import { NavButtonStaticComponent } from "../../components/ui-buttons/nav-button-static/nav-button-static.component";
import { NavButtonActiveComponent } from "../../components/ui-buttons/nav-button-active/nav-button-active.component";
import { WarehouseItemsComponent } from "../../components/warehouse/warehouse-items/warehouse-items.component";
import { HideElementDirective } from '../../directives/hide-element.directive';
import { WarehouseItem } from '../../models/warehouse/warehouse-item.interface';
import { Calendar, CalendarModule } from 'primeng/calendar';
import { CommonModule } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { WarehouseUnitsComponent } from '../../components/warehouse/warehouse-units/warehouse-units.component';

@Component({
  selector: 'app-warehouse',
  imports: [
    CommonModule,
    CalendarModule,
    DialogModule,
    DatePickerModule,
    ButtonModule,
    InputTextModule,
    ConfirmComponent,
    NavButtonStaticComponent,
    NavButtonActiveComponent,
    WarehouseItemsComponent,
    HideElementDirective,
    WarehouseUnitsComponent,
  ],
  templateUrl: './warehouse.component.html',
  styleUrl: './warehouse.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WarehouseComponent {
  private MONTHS = ["LEDEN", "ÚNOR", "BŘEZEN", "DUBEN", "KVĚTEN", "ČERVEN", "ČRVENEC", "SRPEN", "ZÁŘÍ", "ŘÍJEN", "LISTOPAD", "PROSINEC"];
  private MONTHS_NAMES = ["LED", "ÚNO", "BŘE", "DUB", "KVĚ", "ČER", "ČRV", "SRP", "ZÁŘ", "ŘÍJ", "LIS", "PRO"];
  private MONTHS_NUM = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  private authService = inject(AuthService);
  private warehouseService = inject(WarehouseService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  private errorHandlingService = inject(ErrorHandlingService);

  isSaving = signal(false);
  unitIsLoading = false;
  user = computed(() => this.authService.user());
  flipped = signal(false);
  selectedUnit = computed(() => this.warehouseService.selectedUnit());
  unitHeaderTitle = '';
  visible: boolean = false;
  warehouseItemsVisible = signal(false);
  reorderedItems = signal<WarehouseItem[]>([]);

  calendarText = signal<string>(this.MONTHS_NAMES[new Date().getMonth()] + ' ' + new Date().getFullYear().toString().substring(2));
  defaultDate = new Date(new Date().getFullYear(), new Date().getMonth());
  maxDate: Date = new Date(new Date().getFullYear(), new Date().getMonth());
  unitsActive = signal(true);
  destination = signal<string>('F-M');
  visibleList = signal(false);

  @ViewChild('calendar', { static: false }) calendar!: Calendar;
  @ViewChild(WarehouseUnitsComponent) warehouseUnits: any;

  onShowItems() {
    this.reorderedItems.set([]);
    this.warehouseItemsVisible.set(true)
    this.unitsActive.set(false);
  }

  onShowUnits() {
    this.reorderedItems.set([]);
    this.warehouseItemsVisible.set(false);
    this.unitsActive.set(true);
  }

  onShowList() {
    this.visibleList.set(true);
  }

  toggleCalendar() {
    if (this.calendar) {
      if (this.calendar.overlayVisible) {
        this.calendar.hideOverlay();
        this.calendar.cd.detectChanges();
      } else {
        this.calendar.showOverlay();
        this.calendar.cd.detectChanges();
      }
    }
  }

  onSelectMonth() {
    this.calendar.hideOverlay();
    this.calendar.cd.detectChanges();
    this.warehouseUnits.monthYear.set(this.MONTHS_NUM[new Date(this.calendar.value).getMonth()] + new Date(this.calendar.value).getFullYear());
    this.calendarText.set(this.MONTHS_NAMES[new Date(this.calendar.value).getMonth()] + ' ' + new Date(this.calendar.value).getFullYear().toString().substring(2));
    this.warehouseUnits.uploadCards();
  }

  onSelectDestination(destination: string) {
    this.destination.set(destination);
    this.warehouseUnits.destination.set(destination);
    this.warehouseUnits.uploadCards();
  }

  onSave() {
    if (this.reorderedItems().length > 0) {
      this.isSaving.set(true);
      const subscription = this.warehouseService.reorderWarehouseItems(this.reorderedItems()).pipe(
        tap(response => {
          if (response === null) {
            this.isSaving.set(false);
            this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
          } else if (response.isSuccess === false) {
            this.isSaving.set(false);
            this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
          } else if (response.isSuccess) {
            this.warehouseService.setItems(response.result);
            this.reorderedItems.set([]);
            this.isSaving.set(false);
            this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: 'Pořadí položek bylo změněno.' });
          }
        }),
      ).subscribe({
        error: (error) => this.handleError(error),
      });

      this.destroyRef.onDestroy(() => subscription.unsubscribe());
    }
  }

  onOpenPDF() {

  }

  private handleError = (errorRes: HttpErrorResponse) => {
    this.visible = false;
    this.unitIsLoading = true;
    return this.errorHandlingService.handleError(errorRes);
  };
}