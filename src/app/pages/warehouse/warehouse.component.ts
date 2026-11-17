import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  HostListener,
  inject,
  OnDestroy,
  signal,
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
import { ConfirmationComponent } from '../../components/confirmation/confirmation.component';
import { firstValueFrom } from 'rxjs';
import { MobileNavigationService } from '../../services/mobile-navigation.service';

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
  private readonly mobileNavigation = inject(MobileNavigationService);
  private document = inject(DOCUMENT);
  private router = inject(Router);
  private dialog = inject(Dialog);
  private previousBodyOverflowY = '';
  width = signal(window.innerWidth);
  menuShown = computed(
    () =>
      this.width() > 690 ||
      this.mobileNavigation.activeMenu() === 'warehouse-actions',
  );
  destination = this.store.destination();
  items = this.store.warehouseItems;
  navRoute = this.store.warehouseNav;

  constructor() {
    this.previousBodyOverflowY = this.document.body.style.overflowY;
    this.document.body.style.overflowY = 'hidden';
  }

  ngOnInit() {
    this.mobileNavigation.close();
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.width.set(window.innerWidth);
    if (this.width() > 690) {
      this.mobileNavigation.close();
    }
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

  hideMenu() {
    this.mobileNavigation.close();
  }

  async deleteCards() {
    const dialogRef = this.dialog.open<boolean>(ConfirmationComponent, {
      disableClose: false,
      data: {
        text: `Opravdu smazat karty za ${this.store.cards()[0].monthYearName.toLowerCase()}?`,
      },
    });
    const result = await firstValueFrom(dialogRef.closed);

    if (result !== true) {
      return;
    }

    this.store.deleteCards();
  }
}
