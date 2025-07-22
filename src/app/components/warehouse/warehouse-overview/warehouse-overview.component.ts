import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { WarehouseService } from '../../../services/warehouse.service';
import { WarehouseEmptyOverviewComponent } from "../warehouse-empty-overview/warehouse-empty-overview.component";
import { PageAnimation } from '../../../animations/page.animation';
import { tap } from 'rxjs';
import { AlertService } from '../../../services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlingService } from '../../../services/error-handling.service';
import { WarehouseCard } from '../../../models/warehouse/warehouse-card.interface';

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
  imports: [WarehouseEmptyOverviewComponent],
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
  uploadingCards = signal(false);
  // cards = computed(() => this.warehouseService.cards());
  cards = signal<WarehouseCard[]>([]);
  items: string[] = [];
  days = Array(0);
  destination = computed(() => this.warehouseService.destination());
  monthYear = computed(() => this.warehouseService.monthYear());
  overviewCard = signal<OverviewCard | null>(null);
  isUpdating = signal(false);

  ngOnInit(): void {
    this.warehouseService.warehouseNav.set('board');
    this.getCards();
  }

  onChangeInput(x: number, y: number, event: any) {
    const reg = new RegExp('^[0-9]+$');
    const value = event.srcElement.value;
    if (!reg.test(value)) {
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

  private initData() {
    if (this.cards().length > 0) {
      this.items = [];
      this.cards().forEach(card => {
        this.items.push(card.warehouseItemName);
      });
      this.days = Array(new Date(parseInt(this.cards()[0].monthYear.substring(2, 6)), parseInt(this.cards()[0].monthYear.substring(0, 1)), 0).getDate());
    }
  }

  private getData() {
    if (this.cards().length > 0) {
      let overCard: OverviewCard = { lines: [] };
      this.cards().forEach(card => {
        let overviewLine: OverviewLine = { days: [] };
        card.units.forEach(unit => {
          let day: OverViewDay = { amount: '' };
          day.amount = unit?.amount ? unit?.amount.toString() : '';
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
