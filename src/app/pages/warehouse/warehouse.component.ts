import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, inject, signal, ViewChild } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { WarehouseService } from '../../services/warehouse.service';
import { AlertService } from '../../services/alert.service';
import { tap } from 'rxjs';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { WarehouseItemsComponent } from "../../components/warehouse/warehouse-items/warehouse-items.component";
import { WarehouseItem } from '../../models/warehouse/warehouse-item.interface';
import { Calendar, CalendarModule } from 'primeng/calendar';
import { DatePickerModule } from 'primeng/datepicker';
import { WarehouseUnitsComponent } from '../../components/warehouse/warehouse-units/warehouse-units.component';
import { WarehouseNavComponent } from "../../components/warehouse/warehouse-nav/warehouse-nav.component";
import { PageAnimation } from '../../animations/page.animation';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-warehouse',
  imports: [
    CalendarModule,
    DialogModule,
    DatePickerModule,
    ButtonModule,
    InputTextModule,
    ConfirmComponent,
    WarehouseNavComponent,
    FormsModule,
    RouterOutlet
  ],
  templateUrl: './warehouse.component.html',
  styleUrl: './warehouse.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [
    PageAnimation
  ]
})
export class WarehouseComponent {
  private MONTHS_NUM = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  private warehouseService = inject(WarehouseService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  selectedUnit = computed(() => this.warehouseService.selectedUnit());
  unitHeaderTitle = '';
  visible: boolean = false;
  reorderedItems = signal<WarehouseItem[]>([]);
  destination = computed(() => this.warehouseService.destination());
  cards = computed(() => this.warehouseService.cards());
  pdfLoading = signal(false);
  @ViewChild('calendar', { static: false }) calendar!: Calendar;
  @ViewChild(WarehouseUnitsComponent) warehouseUnits: any;
  @ViewChild(WarehouseItemsComponent) warehouseItems: any;
  defaultDate = new Date(new Date().getFullYear(), new Date().getMonth());
  maxDate: Date = new Date(new Date().getFullYear(), new Date().getMonth());

  onSelectMonth() {
    let date = this.calendar.value;
    this.warehouseService.monthYear.set(this.MONTHS_NUM[new Date(date).getMonth()] + new Date(date).getFullYear());
    this.warehouseService.numberOfDays.set(new Date(new Date(date).getFullYear(), new Date(date).getMonth(), 0).getDate());
    this.warehouseService.reloadCards.set(true);
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
        error: () => {
          this.visible = false;
          this.warehouseItems?.isLoading.set(false);
          this.warehouseUnits?.isLoading.set(false);
          this.pdfLoading?.set(false);
        }
      });

      this.destroyRef.onDestroy(() => subscription.unsubscribe());
    }
  }
}