import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { WarehouseCard } from '../../../models/warehouse/warehouse-card.interface';
import { WarehouseUnit } from '../../../models/warehouse/warehouse-unit.interface';
import { AlertService } from '../../../services/alert.service';
import { ErrorHandlingService } from '../../../services/error-handling.service';
import { WarehouseService } from '../../../services/warehouse.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { AuthUser } from '../../../models/auth-user.interface';
import { ConfirmService } from '../../../services/confirm.service';
import { WarehouseUnitsComponent } from '../warehouse-units/warehouse-units.component';

@Component({
  selector: 'app-warehouse-input',
  imports: [DialogModule, ButtonModule, ReactiveFormsModule, CommonModule],
  templateUrl: './warehouse-input.component.html',
  styleUrl: './warehouse-input.component.scss'
})
export class WarehouseInputComponent {
  private warehouseUnitsComponent = inject(WarehouseUnitsComponent);
  private confirmService = inject(ConfirmService);
  private warehouseService = inject(WarehouseService);
  private errorHandlingService = inject(ErrorHandlingService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  card = input.required<WarehouseCard>();
  unitForm!: FormGroup;
  isLoading = signal(false);
  unit = input.required<WarehouseUnit>();
  user = input.required<AuthUser>();
  selectedIndex!: number;
  submitAction = signal<'add' | 'delete' | null>(null);

  ngOnInit() {
    this.initializedItemForm();
    this.selectedIndex = this.warehouseUnitsComponent.cards().indexOf(this.card());
  }

  get amount() {
    return this.unitForm.get('amount');
  }

  onSave(action: 'add' | 'delete') {
    if (this.amount?.value === undefined || this.amount?.value === null) {
      return;
    }
    this.submitAction.set(action);
    this.amount?.disable();

    let _card = structuredClone(this.card());
    let _selectedUnit = _card.units.find(u => u.date === this.unit()!.date);

    if (action === 'delete') {
      this.confirmService.confirm(`Opravdu chceš vynulovat položku ze dne ${this.unit().date}?`)
        .then((confirmed) => {
          if (confirmed) {
            this.isLoading.set(true);
            _selectedUnit!.amount = undefined;
            const subscription = this.warehouseService.createUpdateWarehouseCard(_card).pipe(
              map(response => {
                if (response === null) {
                  this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
                  this.isLoading.set(false);
                } else if (response.isSuccess === false) {
                  this.isLoading.set(false);
                  this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
                } else if (response.isSuccess) {
                  this.amount?.setValue(_selectedUnit?.amount);
                  this.warehouseService.isUpdating.set(true);
                  this.warehouseUnitsComponent.uploadCards();
                  this.isLoading.set(false);
                  this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: 'Položka byla vynulována!' });
                }
              }),

            ).subscribe({
              next: () => {
                this.amount?.enable();
                this.submitAction.set(null);
              },
              error: error => this.handleError(error)
            });

            this.destroyRef.onDestroy(() => {
              subscription.unsubscribe();
            });
          }
        });
    } else {
      this.isLoading.set(true);
      _selectedUnit!.amount = this.amount?.value;
      const subscription = this.warehouseService.createUpdateWarehouseCard(_card).pipe(
        map(response => {
          if (response === null) {
            this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
            this.isLoading.set(false);
          } else if (response.isSuccess === false) {
            this.isLoading.set(false);
            this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
          } else if (response.isSuccess) {
            this.isLoading.set(false);
            this.amount?.setValue(_selectedUnit?.amount);
            this.warehouseService.isUpdating.set(true);
            this.warehouseService.selectedIndex.set(this.selectedIndex);
            this.warehouseUnitsComponent.uploadCards();
            this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: 'Položka byla uložena!' });
          }
        }),

      ).subscribe({
        next: () => {
          this.amount?.enable();
        },
        error: error => this.handleError(error)
      });

      this.destroyRef.onDestroy(() => {
        subscription.unsubscribe();
      });
    }
  }

  checkDate(date: string) {
    let _date = new Date(parseInt(date.split('.')[2]), parseInt(date.split('.')[1]) - 1, parseInt(date.split('.')[0]));
    if (_date > new Date()) {
      return false;
    }
    return true;
  }

  isToday(date: string) {
    let d = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    let today = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
    let fromDate = new Date(parseInt(date.split('.')[2]), parseInt(date.split('.')[1]) - 1, parseInt(date.split('.')[0]));
    let day = fromDate.getDate() + "-" + (fromDate.getMonth() + 1) + "-" + fromDate.getFullYear();
    if (today === day) {
      return true;
    }
    return false;
  }

  private initializedItemForm() {
    this.unitForm = new FormGroup({
      'amount': new FormControl({
        value: this.unit().amount,
        disabled: !this.isToday(this.unit().date) && this.user().role === 'Master'
      }, [
        Validators.required,
        Validators.pattern("^[0-9]*$")
      ]
      )
    });
    this.amount?.markAsUntouched();
  }

  private handleError = (errorRes: HttpErrorResponse) => {
    this.isLoading.set(false);
    return this.errorHandlingService.handleError(errorRes);
  };
}
