import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, inject, OnDestroy, signal, ViewChild } from '@angular/core';
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
import { WarehouseItemsComponent } from "../../components/warehouse/warehouse-items/warehouse-items.component";
import { WarehouseItem } from '../../models/warehouse/warehouse-item.interface';
import { Calendar, CalendarModule } from 'primeng/calendar';
import { DatePickerModule } from 'primeng/datepicker';
import { WarehouseUnitsComponent } from '../../components/warehouse/warehouse-units/warehouse-units.component';
import { WarehouseCard } from '../../models/warehouse/warehouse-card.interface';
import { WarehouseNavComponent } from "../../components/warehouse/warehouse-nav/warehouse-nav.component";
import { ConfirmService } from '../../services/confirm.service';
import { PageAnimation } from '../../animations/page.animation';
import { MasterAddComponent } from '../../components/warehouse/master-add/master-add.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-warehouse',
  imports: [
    CalendarModule,
    DialogModule,
    DatePickerModule,
    ButtonModule,
    InputTextModule,
    ConfirmComponent,
    WarehouseItemsComponent,
    WarehouseUnitsComponent,
    WarehouseNavComponent,
    MasterAddComponent,
    FormsModule
  ],
  templateUrl: './warehouse.component.html',
  styleUrl: './warehouse.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [
    PageAnimation
  ]
})
export class WarehouseComponent {
  private MONTHS_NAMES = ["LED", "ÚNO", "BŘE", "DUB", "KVĚ", "ČER", "ČRV", "SRP", "ZÁŘ", "ŘÍJ", "LIS", "PRO"];
  private MONTHS_NUM = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  private authService = inject(AuthService);
  private warehouseService = inject(WarehouseService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  private errorHandlingService = inject(ErrorHandlingService);
  private confirmService = inject(ConfirmService);
  user = computed(() => this.authService.user());
  selectedUnit = computed(() => this.warehouseService.selectedUnit());
  unitHeaderTitle = '';
  visible: boolean = false;
  warehouseItemsVisible = signal(false);
  reorderedItems = signal<WarehouseItem[]>([]);
  calendarText = signal<string>(this.MONTHS_NAMES[new Date().getMonth()] + ' ' + new Date().getFullYear().toString().substring(2));
  unitsActive = signal(true);
  destination = signal<string>('F-M');
  cards = signal<WarehouseCard[]>([]);
  pdfLoading = signal(false);
  masterAddVisible = signal(false);
  @ViewChild('calendar', { static: false }) calendar!: Calendar;
  @ViewChild(WarehouseUnitsComponent) warehouseUnits: any;
  @ViewChild(WarehouseItemsComponent) warehouseItems: any;
  defaultDate = new Date(new Date().getFullYear(), new Date().getMonth());
  maxDate: Date = new Date(new Date().getFullYear(), new Date().getMonth());

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

  onSelectMonth() {
    let date = this.calendar.value;
    this.warehouseUnits.monthYear.set(this.MONTHS_NUM[new Date(date).getMonth()] + new Date(date).getFullYear());
    this.calendarText.set(this.MONTHS_NAMES[new Date(date).getMonth()] + ' ' + new Date(date).getFullYear().toString().substring(2));
    this.warehouseUnits.uploadCards();
  }

  onSelectDestination(destination: string) {
    this.destination.set(destination);
    this.warehouseUnits.destination.set(destination);
    this.warehouseUnits.uploadCards();
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

  onSave() {
    if (this.reorderedItems().length > 0) {
      const subscription = this.warehouseService.reorderWarehouseItems(this.reorderedItems()).pipe(
        tap(response => {
          if (response === null) {
            this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
          } else if (response.isSuccess === false) {
            this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
          } else if (response.isSuccess) {
            this.warehouseService.setItems(response.result);
            this.reorderedItems.set([]);
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
    if (this.cards().length > 0) {
      this.pdfLoading.set(true);
      const subscription = this.warehouseService.createPDF(this.cards()).pipe(
        tap(response => {
          if (response === null) {
            this.pdfLoading.set(false);
            this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
          } else if (response.isSuccess === false) {
            this.pdfLoading.set(false);
            this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
          } else if (response.isSuccess) {
            this.pdfLoading.set(false);
            const binary = atob(response.result);
            const uint8Array = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              uint8Array[i] = binary.charCodeAt(i);
            }
            const blob = new Blob([uint8Array], { type: 'application/pdf' });
            var url = window.URL.createObjectURL(blob);
            const a = document.createElement('a')
            a.href = url;
            a.download = `Sklad - ${this.cards()[0].monthYearName} - ${this.cards()[0].destination}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
          }
        }),
      ).subscribe({
        error: (error) => this.handleError(error),
      });

      this.destroyRef.onDestroy(() => subscription.unsubscribe());
    }
  }

  onDeleteCards(destination: string) {
    if (this.cards().length === 0) {
      this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Chybí karty.' });
      return;
    }
    this.confirmService.confirm(`Opravdu smazat karty za ${this.cards()[0].monthYearName}?`)
      .then((confirmed) => {
        if (confirmed) {
          this.warehouseUnits.isLoading.set(true);
          const subscription = this.warehouseService.deleteWarehouseCards(this.cards()[0].monthYear, destination).pipe(
            tap(response => {
              if (response === null) {
                this.warehouseUnits.isLoading.set(false);
                this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
              } else if (response.isSuccess === false) {
                this.warehouseUnits.isLoading.set(false);
                this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
              } else {
                this.warehouseUnits.uploadCards();
              }
            })
          ).subscribe({
            error: error => this.handleError(error)
          });

          this.destroyRef.onDestroy(() => {
            subscription.unsubscribe();
          });
        }
      });
  }

  onReloadCards() {
    this.warehouseUnits.uploadCards();
  }

  onReloadItems() {
    this.reorderedItems.set([]);
    this.warehouseItems.uploadItems();
  }

  private handleError = (errorRes: HttpErrorResponse) => {
    this.visible = false;
    this.warehouseItems?.isLoading.set(false);
    this.warehouseUnits?.isLoading.set(false);
    this.pdfLoading?.set(false);
    return this.errorHandlingService.handleError(errorRes);
  };
}