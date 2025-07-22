import { Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { WarehouseService } from '../../../services/warehouse.service';
import { PageAnimation } from '../../../animations/page.animation';
import { tap } from 'rxjs';
import { AlertService } from '../../../services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlingService } from '../../../services/error-handling.service';
import { WarehouseCard } from '../../../models/warehouse/warehouse-card.interface';
import { AuthService } from '../../../services/auth.service';
import { ConfirmService } from '../../../services/confirm.service';

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
  styleUrl: './warehouse-overview.component.scss',
  animations: [
    PageAnimation
  ]
})
export class WarehouseOverviewComponent implements OnInit {
  private errorHandlingService = inject(ErrorHandlingService);
  private warehouseService = inject(WarehouseService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);
  private confirmService = inject(ConfirmService);
  uploadingCards = signal(false);
  loggedUser = this.authService.getUser();
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
  emptyDays = Array(31);

  ngOnInit(): void {
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
    const value = event.srcElement.value;
    if (!reg.test(value)) {
      return;
    }
    if (this.isDisabled(this.cards()[x].units[y].date)) {
      this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Pole nelze aktualizovat!' });
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
          _card!.lines[x].days[y].amount = value;
          this.overviewCard.set(_card);
          this.isUpdating.set(false);
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
        } else if (response.isSuccess === false) {
          _card!.lines[x].days[y].amount = value;
          this.overviewCard.set(_card);
          this.isUpdating.set(false);
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else if (response.isSuccess) {
          _card!.lines[x].days[y].amount = value;
          this.overviewCard.set(_card);
          this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: 'Položka byla aktualizována!' });
          this.isUpdating.set(false);
        }
      }),
    ).subscribe({
      error: (error) => this.handleError(error),
    });

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  getCards() {
    this.uploadingCards.set(true);
    const subscription = this.warehouseService.getWarehouseCards(this.monthYear(), this.destination()).pipe(
      tap(response => {
        if (response === null) {
          this.uploadingCards.set(false);
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
        } else if (response.isSuccess === false) {
          this.uploadingCards.set(false);
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
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
      error: (error) => this.handleError(error),
    });

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  isDisabled(date: string) {
    let day = parseInt(date.split('.')[0]);
    let today = new Date().getDate();

    if (this.loggedUser.role === 'Master') {
      if (day < today) {
        return true;
      }
      if (day === today) {
        return false;
      }
    }

    if (day > today) {
      return true;
    }

    return false;
  }

  private onDeleteCards() {
    this.warehouseService.deleteCards.set(false);
    if (this.cards().length === 0) {
      this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Chybí karty.' });
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
                this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
              } else if (response.isSuccess === false) {
                this.uploadingCards.set(false);
                this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
              } else {
                this.warehouseService.isUpdating.set(true);
                this.getCards();
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

  private handleError = (errorRes: HttpErrorResponse) => {
    return this.errorHandlingService.handleError(errorRes);
  };
}
