import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, ElementRef, inject, model, OnInit, signal, ViewChild } from '@angular/core';
import { WarehouseService } from '../../../services/warehouse.service';
import { AlertService } from '../../../services/alert.service';
import { tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlingService } from '../../../services/error-handling.service';
import { WarehouseCard } from '../../../models/warehouse/warehouse-card.interface';
import { SpinnerComponent } from "../../spinner/spinner.component";
import Swiper from 'swiper';
import { CommonModule } from '@angular/common';
import { CreateUpdateUnitComponent } from '../create-update-unit/create-update-unit.component';
import { ItemsListComponent } from '../items-list/items-list.component';
import { WarehouseUnit } from '../../../models/warehouse/warehouse-unit.interface';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-warehouse-units',
  imports: [CommonModule, SpinnerComponent, CreateUpdateUnitComponent, ItemsListComponent],
  templateUrl: './warehouse-units.component.html',
  styleUrl: './warehouse-units.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WarehouseUnitsComponent implements OnInit {
  private MONTHS_NUM = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  private warehouseService = inject(WarehouseService);
  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  private errorHandlingService = inject(ErrorHandlingService);
  private swiper!: Swiper;
  user = computed(() => this.authService.user());
  isLoading = signal(false);
  cards = signal<WarehouseCard[]>([]);
  destination = signal<string>('F-M');
  monthYear = signal<string>(this.MONTHS_NUM[new Date().getMonth()] + new Date().getFullYear());
  visibleModal = signal<boolean>(false);
  visibleList = model(false);
  items: {
    name: string;
    id: number;
  }[] = [];
  selectedIndex = signal<number>(0);
  selectedUnit = signal<WarehouseUnit>({
    id: 0,
    warehouseCardId: 0,
    warehouseItemId: 0,
    date: '',
    amount: undefined
  });

  @ViewChild('swiperRef', { static: false }) swiperRef!: ElementRef;

  ngOnInit(): void {
    if (this.user().role === 'Master') {
      this.destination.set(this.user().destination);
    }
    this.uploadCards();
  }

  onSwiperInit(event: any) {
    setTimeout(() => {
      const swiper = (this.swiperRef.nativeElement as any).swiper;
      if (swiper) {
        swiper.on('slideChange', () => {
        });
      }
    });
  }

  checkDate(date: string) {
    if (date === '01.01.0000') {
      return;
    }
    let _date = new Date(parseInt(date.split('.')[2]), parseInt(date.split('.')[1]) - 1, parseInt(date.split('.')[0]));
    if (_date > new Date()) {
      return false;
    }
    return true;
  }

  onSelectUnit(unit: any) {
    this.swiper = this.swiperRef.nativeElement.swiper;
    this.selectedIndex.set(this.swiper.activeIndex);
    this.selectedUnit.set(unit);
    this.visibleModal.set(true);
  }

  onSelectItem(itemId: number) {
    if (itemId === -1) {
      this.visibleList.set(false);
      return;
    }
    this.visibleList.set(false);
    this.swiper = this.swiperRef.nativeElement.swiper;

    let index = this.cards().findIndex(u => u.warehouseItemId === itemId);
    this.swiper.slideTo(index);
  }

  uploadCards() {
    this.isLoading.set(true);
    this.items = [];
    this.cards.set([]);
    const subscription = this.warehouseService.getWarehouseCards(this.monthYear(), this.destination()).pipe(
      tap(response => {
        if (response === null) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
          this.isLoading.set(false);
        } else if (response.isSuccess === false) {
          this.isLoading.set(false);
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else if (response.isSuccess) {
          if (response.result.length > 0) {
            this.cards.set(response.result);
            this.getItems();
            setTimeout(() => {
              this.swiper = this.swiperRef.nativeElement.swiper;
              this.swiper.slideTo(this.selectedIndex());
            }, 100);
          }
          this.isLoading.set(false);
        }
      }),

    ).subscribe({
      next: () => { },
      error: error => this.handleError(error)
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  private getItems() {
    this.cards().forEach(card => {
      this.items.push({ name: card.warehouseItemName, id: card.warehouseItemId });
    });
  }

  private handleError = (errorRes: HttpErrorResponse) => {
    this.isLoading.set(false);
    return this.errorHandlingService.handleError(errorRes);
  };

}
