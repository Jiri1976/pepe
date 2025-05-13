import { Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, effect, ElementRef, inject, input, model, OnInit, signal, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-warehouse-units',
  imports: [CommonModule, SpinnerComponent, CreateUpdateUnitComponent],
  templateUrl: './warehouse-units.component.html',
  styleUrl: './warehouse-units.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WarehouseUnitsComponent implements OnInit {
  private MONTHS_NUM = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  private warehouseService = inject(WarehouseService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  private errorHandlingService = inject(ErrorHandlingService);
  private swiper!: Swiper;
  isLoading = signal(false);
  cards = signal<WarehouseCard[]>([]);
  destination = signal<string>('F-M');
  monthYear = signal<string>(this.MONTHS_NUM[new Date().getMonth()] + new Date().getFullYear());
  visibleModal = signal<boolean>(false);

  @ViewChild('swiperRef', { static: false }) swiperRef!: ElementRef;

  ngOnInit(): void {
    this.uploadCards();
  }

  onSwiperInit(event: any) {
    setTimeout(() => {
      const swiper = (this.swiperRef.nativeElement as any).swiper;
      if (swiper) {
        swiper.on('slideChange', () => {
          // console.log('Slide changed! Index:', swiper.activeIndex);
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
    this.visibleModal.set(true);
    console.log(unit);

  }

  changes = effect(() => {
    console.log(('changed'));

  });

  uploadCards() {
    this.isLoading.set(true);
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
            let emptyUnit = {
              id: 0,
              warehouseCardId: 0,
              warehouseItemId: 0,
              date: '01.01.0000',
            }
            for (let i = 0; i < response.result.length; i++) {
              for (let y = response.result[i].units.length; y < 33; y++) {
                response.result[i].units.push(emptyUnit);
              }
            }
            this.cards.set(response.result);
            this.isLoading.set(false);
          }
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

  private handleError = (errorRes: HttpErrorResponse) => {
    this.isLoading.set(false);
    return this.errorHandlingService.handleError(errorRes);
  };

}
