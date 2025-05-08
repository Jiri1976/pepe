import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { WarehouseService } from '../../../services/warehouse.service';
import { AlertService } from '../../../services/alert.service';
import { tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlingService } from '../../../services/error-handling.service';
import { WarehouseCard } from '../../../models/warehouse/warehouse-card.interface';
import { SpinnerComponent } from "../../spinner/spinner.component";

@Component({
  selector: 'app-warehouse-units',
  imports: [SpinnerComponent],
  templateUrl: './warehouse-units.component.html',
  styleUrl: './warehouse-units.component.scss'
})
export class WarehouseUnitsComponent implements OnInit {
  private warehouseService = inject(WarehouseService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  private errorHandlingService = inject(ErrorHandlingService);
  isLoading = signal(false);
  cards = signal<WarehouseCard[]>([]);

  ngOnInit(): void {
    this.isLoading.set(true);
    const subscription = this.warehouseService.getWarehouseCards('052025', 'F-M').pipe(
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
            console.log(this.cards());

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
