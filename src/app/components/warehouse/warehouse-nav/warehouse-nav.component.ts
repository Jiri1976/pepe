import { Component, computed, inject, model, signal, ViewChild } from '@angular/core';
import { WarehouseComponent } from '../../../pages/warehouse/warehouse.component';
import { FormsModule } from '@angular/forms';
import { Calendar, CalendarModule } from 'primeng/calendar';
import { DatePickerModule } from 'primeng/datepicker';
import { WarehouseService } from '../../../services/warehouse.service';
import { trigger, transition, animate, style } from '@angular/animations';
import { WarehouseItem } from '../../../models/warehouse/warehouse-item.interface';
import { HideElementDirective } from '../../../directives/hide-element.directive';
import { HideWhenAdminDirective } from '../../../directives/hide-when-admin.directive';
import { WarehouseItemsComponent } from '../warehouse-items/warehouse-items.component';

@Component({
  selector: 'app-warehouse-nav',
  imports: [CalendarModule, DatePickerModule, FormsModule, HideElementDirective, HideWhenAdminDirective],
  templateUrl: './warehouse-nav.component.html',
  styleUrl: './warehouse-nav.component.scss',
  animations: [
    trigger('fadeOut', [
      transition(':leave', [
        animate('500ms ease-out', style({ opacity: 0 })),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-in', style({ opacity: 1 })),
      ])
    ]),
  ]
})
export class WarehouseNavComponent {
  private warehouseService = inject(WarehouseService);
  private _warehouseItemsComp: WarehouseItemsComponent | undefined;
  warehouseComp = inject(WarehouseComponent);
  isOpened = signal(true);
  warehouseItemsVisible = model(false);
  unitsActive = model(true);
  defaultDate = new Date(new Date().getFullYear(), new Date().getMonth());
  maxDate: Date = new Date(new Date().getFullYear(), new Date().getMonth());
  calendarText = model('');
  destination = model<string>('F-M');
  pdfLoading = model(false);
  reorderedItems = model<WarehouseItem[]>([]);
  items = computed(() => this.warehouseService.items());
  @ViewChild('calendar', { static: false }) calendar!: Calendar;
  @ViewChild(WarehouseItemsComponent)
  set warehouseItemsComp(comp: WarehouseItemsComponent | undefined) {
    this._warehouseItemsComp = comp;
  }

  onOpen() {
    if (this.unitsActive()) {
      if (this.warehouseComp.cards.length === 0) {
        return;
      }
      this.warehouseComp.onReloadCards();
    }
  }

  onSelectMonth() {
    this.calendar.hideOverlay();
    this.calendar.cd.detectChanges();
    this.warehouseComp.onSelectMonth(this.calendar.value);
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

  onShowList() {
    this.warehouseService.visibleList.set(true);
  }

  onDeleteCards() {
    this.warehouseComp.onDeleteCards(this.destination());
  }

  onAddItem() {
    this.warehouseService.callOnAddItem();
  }

  onOpenMasterAdd() {
    this.warehouseComp.masterAddVisible.set(true);

  }
}