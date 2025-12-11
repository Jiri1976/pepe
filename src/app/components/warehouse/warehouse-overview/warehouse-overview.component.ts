import { Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { WarehouseService } from '../../../services/warehouse.service';
import { tap } from 'rxjs';
import { WarehouseCard } from '../../../models/warehouse/warehouse-card.interface';
import { ConfirmService } from '../../../services/confirm.service';
import { ToasterService } from '../../../services/toaster.service';
import { SignalService } from '../../../services/signal.service';
import { AuthStore } from '../../../stores/auth-store/auth.store';

interface OverViewDay {
  amount: string;
}

interface OverviewLine {
  days: OverViewDay[];
}

interface OverviewCard {
  lines: OverviewLine[]
}

@Component({
  selector: 'app-warehouse-overview',
  imports: [],
  templateUrl: './warehouse-overview.component.html',
  styleUrl: './warehouse-overview.component.scss'
})
export class WarehouseOverviewComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  private MONTHS_NUM = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  private warehouseService = inject(WarehouseService);
  private toaster = inject(ToasterService);
  private destroyRef = inject(DestroyRef);
  private confirmService = inject(ConfirmService);
  private signalService = inject(SignalService);
  uploadingCards = signal(false);
  cards = signal<WarehouseCard[]>([]);
  items = signal<string[]>([]);
  days = signal<Array<number>>(Array(0));
  destination = computed(() => this.warehouseService.destination());
  monthYear = computed(() => this.warehouseService.monthYear());
  overviewCard = signal<OverviewCard | null>(null);
  isUpdating = signal(false);
  reloadCards = computed(() => this.warehouseService.reloadCards());
  deleteCards = computed(() => this.warehouseService.deleteCards());
  emptyCards = Array(10);
  emptyDays = computed(() => Array(this.warehouseService.numberOfDays()));
  highlightedInputs = new Set<string>();

  ngOnInit(): void {
    this.warehouseService.monthYear.set(this.MONTHS_NUM[new Date().getMonth()] + new Date().getFullYear());
    this.warehouseService.resetDefaultDate();
    this.warehouseService.warehouseNav.set('board');
    this.getCards();
  }

  reload = effect(() => {
    if (this.reloadCards()) {
      this.getCards();
    }
    if (this.deleteCards()) {
      this.onDeleteCards();
    }
  });

  onChangeInput(x: number, y: number, event: any) {
    const reg = new RegExp('^[0-9]+$');
    if (!reg.test((event.target as HTMLInputElement).value)) {
      return;
    }

    const key = `${x}-${y}`;
    this.highlightedInputs.add(key);

    setTimeout(() => {
      this.highlightedInputs.delete(key);
    }, 1000);

    const value = parseInt((event.target as HTMLInputElement).value);
    if (this.isDisabled(this.cards()[x].units[y].date)) {
      this.toaster.error('Pole nelze aktualizovat!');
      return;
    }
    this.isUpdating.set(true);
    let _card = structuredClone(this.overviewCard());
    _card!.lines[x].days[y].amount = 'L';
    this.overviewCard.set(_card);

    let updatingCard = structuredClone(this.cards()[x]);
    updatingCard.units[y].amount = value;

    const subscription = this.warehouseService.createUpdateWarehouseCard(updatingCard).pipe(
      tap(response => {
        if (response === null) {
          _card!.lines[x].days[y].amount = value.toString();
          this.overviewCard.set(_card);
          this.isUpdating.set(false);
          this.toaster.error('Něco se pokazilo, zkus to znovu.');
        } else if (response.isSuccess === false) {
          _card!.lines[x].days[y].amount = value.toString();
          this.overviewCard.set(_card);
          this.isUpdating.set(false);
          this.toaster.error(response.errorMessage);
        } else if (response.isSuccess) {
          _card!.lines[x].days[y].amount = value.toString();
          this.overviewCard.set(_card);
          this.toaster.success('Položka byla aktualizována!');
          this.signalService.sendCards(this.destination(), true, false);
          this.isUpdating.set(false);
        }
      }),
    ).subscribe({
      error: () => this.isUpdating.set(false),
    });

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  getCards() {
    this.uploadingCards.set(true);
    const subscription = this.warehouseService.getWarehouseCards(this.monthYear(), this.destination()).pipe(
      tap(response => {
        if (response === null) {
          this.uploadingCards.set(false);
          this.toaster.error('Něco se pokazilo, zkus to znovu.');
        } else if (response.isSuccess === false) {
          this.uploadingCards.set(false);
          this.toaster.error(response.errorMessage);
        } else if (response.isSuccess) {
          this.warehouseService.reloadCards.set(false);
          this.warehouseService.cards.set(response.result);
          this.cards.set(response.result);
          this.getData();
          this.initData();
          this.uploadingCards.set(false);
        }
      }),
    ).subscribe({
      error: () => this.uploadingCards.set(false)
    });

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
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

  onBlur(event: any) {
    event.preventDefault();
  }

  private onDeleteCards() {
    this.warehouseService.deleteCards.set(false);
    if (this.cards().length === 0) {
      this.toaster.error('Chybí karty.');
      return;
    }
    this.confirmService.confirm(`Opravdu smazat karty za ${this.cards()[0].monthYearName}?`)
      .then((confirmed) => {
        if (confirmed) {
          this.uploadingCards.set(true);
          const subscription = this.warehouseService.deleteWarehouseCards(this.cards()[0].monthYear, this.destination()).pipe(
            tap(response => {
              if (response === null) {
                this.uploadingCards.set(false);
                this.toaster.error('Něco se pokazilo, zkus to znovu.');
              } else if (response.isSuccess === false) {
                this.uploadingCards.set(false);
                this.toaster.error(response.errorMessage);
              } else {
                this.warehouseService.isUpdating.set(true);
                this.getCards();
              }
            })
          ).subscribe({
            error: () => this.uploadingCards.set(false)
          });

          this.destroyRef.onDestroy(() => {
            subscription.unsubscribe();
          });
        }
      });
  }

  private initData() {
    if (this.cards().length > 0) {
      this.items.set([]);
      this.days.set(Array(0));
      let _items: string[] = [];
      this.cards().forEach(card => {
        _items.push(card.warehouseItemName);
      });
      this.items.set(_items);
      this.days.set(Array(this.cards()[0].units.length));
    }
  }

  private getData() {
    if (this.cards().length > 0) {
      let overCard: OverviewCard = { lines: [] };
      this.cards().forEach(card => {
        let overviewLine: OverviewLine = { days: [] };
        card.units.forEach(unit => {
          let day: OverViewDay = { amount: '' };
          day.amount = unit?.amount !== null ? unit.amount!.toString() : '';
          overviewLine.days.push(day);
        });
        overCard.lines.push(overviewLine)
      });
      this.overviewCard.set(overCard)
    }
  }
}