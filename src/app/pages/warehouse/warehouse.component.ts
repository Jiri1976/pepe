import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AdminWarehouseComponent } from '../../components/admin-warehouse/admin-warehouse.component';
import { MasterWarehouseComponent } from '../../components/master-warehouse/master-warehouse.component';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { AddWarehouseItemComponent } from '../../components/add-warehouse-item/add-warehouse-item.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { WarehouseService } from '../../services/warehouse.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '../../services/alert.service';
import { tap } from 'rxjs';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { WarehouseCard } from '../../models/warehouse/warehouse-card.interface';
import { ErrorHandlingService } from '../../services/error-handling.service';
import { ConfirmService } from '../../services/confirm.service';
import { NavButtonStaticComponent } from "../../components/ui-buttons/nav-button-static/nav-button-static.component";
import { NavButtonActiveComponent } from "../../components/ui-buttons/nav-button-active/nav-button-active.component";

@Component({
  selector: 'app-warehouse',
  imports: [AdminWarehouseComponent, MasterWarehouseComponent, SpinnerComponent, AddWarehouseItemComponent, DialogModule, ButtonModule, InputTextModule, ReactiveFormsModule, ConfirmComponent, NavButtonStaticComponent, NavButtonActiveComponent],
  templateUrl: './warehouse.component.html',
  styleUrl: './warehouse.component.scss'
})
export class WarehouseComponent implements OnInit {
  private authService = inject(AuthService);
  private warehouseService = inject(WarehouseService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  private errorHandlingService = inject(ErrorHandlingService);
  private confirmService = inject(ConfirmService);

  isLoading = false;
  unitIsLoading = false;
  user = computed(() => this.authService.user());
  flipped = signal(false);
  selectedUnit = computed(() => this.warehouseService.selectedUnit());
  unitHeaderTitle = '';
  visible: boolean = false;
  unitForm!: FormGroup;
  oldCard!: WarehouseCard;

  ngOnInit() {
    this.initializedUnitForm();
  }

  get amount() {
    return this.unitForm.get('amount');
  }

  onFlipCard(showCheck: boolean) {
    this.flipped.set(showCheck);
    this.unitIsLoading = false;
  }

  onSelectUnit() {
    this.oldCard = { ...this.warehouseService.getCard() };
    if (this.selectedUnit().amount === null) {
      this.unitHeaderTitle = 'Zapsat hodnotu?';
    } else {
      this.unitHeaderTitle = 'Upravit hodnotu?';
    }
    this.visible = true;
    this.initializedUnitForm();
  }

  onInput(value: string) {
    this.amount?.setValue(value);
  }

  onSubmit() {
    this.confirmService.confirm(`Opravdu chceš ${this.unitHeaderTitle.toLowerCase()}?`)
      .then((confirmed) => {
        if (confirmed) {
          this.visible = false;
          this.unitIsLoading = true;
          if (this.unitForm.invalid) {
            return;
          }
          if (typeof (+this.amount?.value) !== "number" || isNaN(+this.amount?.value)) {
            return;
          }
          let data = { ...this.selectedUnit() };
          data.amount = this.amount?.value;

          const subscription = this.warehouseService.createUpdateWarehouseCard(data).pipe(
            tap(response => {
              this.unitIsLoading = false;
              if (response === null) {
                this.nullResponse();
              } else if (response.isSuccess === false) {
                this.oldCard.units.forEach(unit => {
                  if (unit.date === this.selectedUnit().date) {
                    unit.amount = null!;
                  }
                });
                this.warehouseService.setWarehouseCard(this.oldCard);
                this.amount?.setValue(null);
                this.alertService.setAlert({
                  severity: 'error',
                  summary: 'Error',
                  detail: response.errorMessage
                });
              } else if (response.isSuccess === true) {
                this.alertService.setAlert({
                  severity: 'success',
                  summary: 'Success',
                  detail: this.selectedUnit().amount === null ? 'Hodnota byla zapsána.' : 'Hodnota byla upravena.'
                });
                this.warehouseService.setWarehouseCard(response.result);
              }
            }),
            tap({
              error: error => this.handleError(error)
            })
          ).subscribe();

          this.destroyRef.onDestroy(() => {
            subscription.unsubscribe();
          });
        }
      });
  }

  onClearWarehouseUnit() {
    this.confirmService.confirm('Opravdu chceš smazat hodnotu?')
      .then((confirmed) => {
        if (confirmed) {
          this.visible = false;
          this.unitIsLoading = true;
          const subscription = this.warehouseService.clearWarehouseUnit(this.selectedUnit()).pipe(
            tap(response => {
              this.unitIsLoading = false;
              if (response === null) {
                this.nullResponse();
                this.warehouseService.setWarehouseCard(this.oldCard);
              } else if (response.isSuccess === false) {
                this.warehouseService.setWarehouseCard(this.oldCard);
                this.amount?.setValue(undefined);
                this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
              } else {
                this.amount?.setValue(undefined);
                this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: 'Hodnota byla smazána.' });
                this.warehouseService.setWarehouseCard(response.result);
              }
            }),
            tap({
              error: error => this.handleError(error)
            })
          ).subscribe();

          this.destroyRef.onDestroy(() => {
            subscription.unsubscribe();
          });
        }
      });
  }

  private initializedUnitForm() {
    this.unitForm = new FormGroup({
      'amount': new FormControl({
        value: this.selectedUnit().amount,
        disabled: false
      }, [Validators.required, Validators.min(0), Validators.max(10000)])
    });
  }

  private nullResponse() {
    this.amount?.setValue(undefined);
    this.alertService.setAlert({
      severity: 'error',
      summary: 'Error',
      detail: 'Něco se pokazilo, zkus to znovu.'
    });
  }

  private handleError = (errorRes: HttpErrorResponse) => {
    this.isLoading = false;
    this.visible = false;
    this.unitIsLoading = true;
    return this.errorHandlingService.handleError(errorRes);
  };
}