import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, effect, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { WarehouseService } from '../../../services/warehouse.service';
import { AlertService } from '../../../services/alert.service';
import { tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlingService } from '../../../services/error-handling.service';
import Swiper from 'swiper';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { HideElementDirective } from '../../../directives/hide-element.directive';
import { ConfirmService } from '../../../services/confirm.service';
import { WarehouseInputComponent } from "../warehouse-input/warehouse-input.component";
import { PageAnimation } from '../../../animations/page.animation';

@Component({
  selector: 'app-warehouse-units',
  imports: [CommonModule, HideElementDirective, WarehouseInputComponent],
  templateUrl: './warehouse-units.component.html',
  styleUrl: './warehouse-units.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [
    PageAnimation
  ]
})
export class WarehouseUnitsComponent implements OnInit {
  private MONTHS_NUM = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  private warehouseService = inject(WarehouseService);
  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  private errorHandlingService = inject(ErrorHandlingService);
  private swiper!: Swiper;
  private confirmService = inject(ConfirmService);
  user = computed(() => this.authService.user());
  isLoading = signal(false);
  reloadCards = computed(() => this.warehouseService.reloadCards());
  deleteCards = computed(() => this.warehouseService.deleteCards());
  cards = computed(() => this.warehouseService.cards());
  destination = computed(() => this.warehouseService.destination());
  monthYear = computed(() => this.warehouseService.monthYear());
  selectedListItemId = computed(() => this.warehouseService.selectedListItemId());
  selectedIndex = computed(() => this.warehouseService.selectedIndex());
  @ViewChild('swiperRef', { static: false }) swiperRef!: ElementRef;

  reload = effect(() => {
    if (this.reloadCards()) {
      this.uploadCards();
    }
    if (this.deleteCards()) {
      this.onDeleteCards();
    }
    if (this.selectedListItemId() > -1) {
      this.onSelectItem(this.selectedListItemId());
    }
  });

  ngOnInit(): void {
    this.warehouseService.monthYear.set(this.MONTHS_NUM[new Date().getMonth()] + new Date().getFullYear());
    this.warehouseService.warehouseNav.set('units');
    if (this.user().role === 'Master') {
      this.warehouseService.destination.set(this.user().destination);
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

  uploadCards() {
    this.isLoading.set(true);
    this.warehouseService.reloadCards.set(false);
    this.warehouseService.cards.set([]);
    const subscription = this.warehouseService.getWarehouseCards(this.monthYear(), this.destination()).pipe(
      tap(response => {
        if (response === null) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
          this.isLoading.set(false);
        } else if (response.isSuccess === false) {
          this.isLoading.set(false);
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else if (response.isSuccess) {
          this.warehouseService.sendCards(this.destination(), this.warehouseService.isUpdating(), false);
          if (this.warehouseService.isUpdating()) {
            this.warehouseService.isUpdating.set(false);
          }
          if (response.result.length > 0) {
            this.warehouseService.cards.set(response.result);
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

  onDeleteCard(id: number) {
    let card = this.cards().find(c => c.id === id);
    this.confirmService.confirm(`Opravdu chceš smazat kartu ${card?.warehouseItemName}?`)
      .then((confirmed) => {
        if (confirmed) {
          let index = this.cards().findIndex(c => c.id === id);
          if (index !== -1) {
            this.warehouseService.selectedIndex.set(index);
          }
          this.isLoading.set(true);
          const subscription = this.warehouseService.deleteWarehouseCard(id).pipe(
            tap(response => {
              if (response === null) {
                this.isLoading.set(false);
                this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
              } else if (response.isSuccess === false) {
                this.isLoading.set(false);
                this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
              } else {
                this.warehouseService.isUpdating.set(true);
                this.uploadCards();
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

  private onSelectItem(itemId: number) {
    if (itemId === -1) {
      return;
    }
    this.warehouseService.selectedListItemId.set(-1);
    this.swiper = this.swiperRef.nativeElement.swiper;
    let index = this.cards().findIndex(u => u.warehouseItemId === itemId);
    this.swiper.slideTo(index);
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
          this.isLoading.set(true);
          const subscription = this.warehouseService.deleteWarehouseCards(this.cards()[0].monthYear, this.destination()).pipe(
            tap(response => {
              if (response === null) {
                this.isLoading.set(false);
                this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
              } else if (response.isSuccess === false) {
                this.isLoading.set(false);
                this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
              } else {
                this.warehouseService.isUpdating.set(true);
                this.uploadCards();
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

  private handleError = (errorRes: HttpErrorResponse) => {
    this.isLoading.set(false);
    return this.errorHandlingService.handleError(errorRes);
  };
}
