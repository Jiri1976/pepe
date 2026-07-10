import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnDestroy,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { WarehouseStore } from '../../stores/warehouse-store/warehouse.store';
import { MONTHS_NUM } from '../../helpers/common-constants.helper';
import { NavigationComponent } from '../../components/navigation/navigation.component';
import { NavButtonComponent } from '../../components/navigation/nav-button.component';
import { AuthStore } from '../../stores/auth-store/auth.store';
import { Dialog } from '@angular/cdk/dialog';
import { ItemsListComponent } from '../../components/warehouse/items-list/items-list.component';
import { CalendarComponent } from '../../components/calendar/calendar.component';

@Component({
  selector: 'app-warehouse',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    RouterOutlet,
    NavigationComponent,
    NavButtonComponent,
    CalendarComponent,
  ],
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WarehouseComponent implements OnDestroy {
  readonly store = inject(WarehouseStore);
  readonly authStore = inject(AuthStore);
  private document = inject(DOCUMENT);
  private router = inject(Router);
  private dialog = inject(Dialog);
  private previousBodyOverflowY = '';
  destination = this.store.destination();
  items = this.store.warehouseItems;
  navRoute = this.store.warehouseNav;

  constructor() {
    this.previousBodyOverflowY = this.document.body.style.overflowY;
    this.document.body.style.overflowY = 'hidden';
  }

  ngOnDestroy(): void {
    this.document.body.style.overflowY = this.previousBodyOverflowY;
  }

  onSelectMonth(date: Date) {
    let _monthYear = MONTHS_NUM[date.getMonth()] + date.getFullYear();
    this.store.setMonthYear(_monthYear);
    this.store.closeCalendar();
  }

  onToggleCalendar(event: MouseEvent) {
    event.stopPropagation();
    if (this.store.isCalendarOpen()) {
      this.store.closeCalendar();
    } else {
      this.store.openCalendar();
    }
  }

  onShowList() {
    this.dialog.open(ItemsListComponent, { disableClose: false });
  }

  onShowItems() {
    this.router.navigate(['warehouse', 'warehouse-items']);
  }

  onShowUnits() {
    this.router.navigate(['warehouse', 'warehouse-units']);
  }

  onShowBoard() {
    this.router.navigate(['warehouse']);
  }
}
