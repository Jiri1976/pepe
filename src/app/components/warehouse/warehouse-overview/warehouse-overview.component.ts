import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { AuthStore } from '../../../stores/auth-store/auth.store';
import { WarehouseStore } from '../../../stores/warehouse-store/warehouse.store';
import { SkeletonOverviewComponent } from "./skeleton-overview/skeleton-overview.component";

@Component({
  selector: 'app-warehouse-overview',
  imports: [SkeletonOverviewComponent],
  templateUrl: './warehouse-overview.component.html',
  styleUrl: './warehouse-overview.component.scss'
})
export class WarehouseOverviewComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly warehouseStore = inject(WarehouseStore);
  cards = this.warehouseStore.cards;
  overviewItems = this.warehouseStore.overviewItems;
  days = this.warehouseStore.countOfDays;
  destination = this.warehouseStore.destination;
  monthYear = this.warehouseStore.monthYear;
  overviewCard = this.warehouseStore.overviewCard;
  highlightedInputs = new Set<string>();
  height = signal(window.innerHeight);

  ngOnInit(): void {
    const user = this.authStore.user();
    if (user?.role === 'master' && user.destination !== this.warehouseStore.destination()) {
      this.warehouseStore.setDestination(user.destination);
    }
    this.warehouseStore.resetMonthYaer();
    this.warehouseStore.setWarehouseNave('board');
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.height.set(window.innerHeight);
  }

  bodyStyles = computed(() => {
    const shouldScroll = this.cards() && this.cards().length > 0 && this.height() < 700 ||
      this.cards() && this.cards().length > 13 && this.height() > 700 && this.height() < 920;

    return shouldScroll ? {
      'maxHeight': '520px',
      'overflow-y': 'auto'
    } : {};
  });

  onChangeInput(x: number, y: number, event: any) {
    const input = (event.target as HTMLInputElement).value;

    if (input !== "") {
      const reg = new RegExp('^[0-9]+$');
      if (!reg.test(input)) {
        return;
      }
    }

    const key = `${x}-${y}`;
    this.highlightedInputs.add(key);

    setTimeout(() => {
      this.highlightedInputs.delete(key);
    }, 1000);

    const value = parseInt((event.target as HTMLInputElement).value);
    if (this.isDisabled(this.cards()[x].units[y].date)) {
      this.authStore.error('Pole nelze aktualizovat!');
      return;
    }

    if (this.cards()[x].units[y].amount === null && input === '') {
      return;
    }

    let _card = structuredClone(this.overviewCard());
    _card!.lines[x].days[y].amount = 'L';

    let updatingCard = structuredClone(this.cards()[x]);
    updatingCard.units[y].amount = value;

    this.warehouseStore.createUpdateWarehouseCard(updatingCard, `${updatingCard.monthYearName}, ${updatingCard.warehouseItemName.toLocaleLowerCase()} - ${input === '' ? 'anulováno' : value + 'ks'}`);
  }

  isDisabled(date: string) {
    const day = parseInt(date.split('.')[0]);
    const month = parseInt(date.split('.')[1]) - 1;
    const year = parseInt(date.split('.')[2])
    const today = new Date().getDate();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    if (this.authStore.user()?.role === 'Master') {
      if (day === today && month === currentMonth && year === currentYear) {
        return false;
      }
      return true;
    }

    if (day > today && month === currentMonth && year === currentYear) {
      return true;
    }
    return false;
  }

  isToday(date: string) {
    const day = parseInt(date.split('.')[0]);
    const month = parseInt(date.split('.')[1]) - 1;
    const year = parseInt(date.split('.')[2])
    const today = new Date().getDate();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    if (day === today && month === currentMonth && year === currentYear) {
      return true;
    }
    return false;
  }
}