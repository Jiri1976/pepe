
import { Component, DestroyRef, effect, inject, input, model, OnInit, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { WarehouseCard } from '../../../models/warehouse/warehouse-card.interface';
import { WarehouseUnit } from '../../../models/warehouse/warehouse-unit.interface';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '../../../services/alert.service';
import { ErrorHandlingService } from '../../../services/error-handling.service';
import { WarehouseService } from '../../../services/warehouse.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-create-update-unit',
  imports: [DialogModule, ButtonModule, ReactiveFormsModule],
  templateUrl: './create-update-unit.component.html',
  styleUrl: './create-update-unit.component.scss'
})
export class CreateUpdateUnitComponent implements OnInit {
  private warehouseService = inject(WarehouseService);
  private errorHandlingService = inject(ErrorHandlingService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  visibleModal = model<boolean>(false);
  index = input.required<number>();
  selectedUnit = model<WarehouseUnit>();
  cards = input.required<WarehouseCard[]>();
  unitForm!: FormGroup;
  isLoading = signal(false);
  updated = output<void>();

  reload = effect(() => {
    this.initializedItemForm();
  })

  ngOnInit() {
    this.initializedItemForm();
  }

  get amount() {
    return this.unitForm.get('amount');
  }

  onCancel() {
    this.visibleModal.set(false);
  }

  onSave(action: 'add' | 'delete') {
    this.amount?.disable();
    if (action === 'delete') {
      this.amount?.setValue(undefined);
    }
    this.isLoading.set(true);
    let _cards = structuredClone(this.cards());
    let _selectedUnit = _cards[this.index()].units.find(u => u.date === this.selectedUnit()!.date);
    _selectedUnit!.amount = action === 'delete' ? undefined : this.amount?.value;

    const subscription = this.warehouseService.createUpdateWarehouseCard(_cards[this.index()]).pipe(
      map(response => {
        if (response === null) {
          _selectedUnit!.amount = this.selectedUnit()!.amount;
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
          this.isLoading.set(false);
        } else if (response.isSuccess === false) {
          _selectedUnit!.amount = this.selectedUnit()!.amount;
          this.isLoading.set(false);
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else if (response.isSuccess) {
          this.isLoading.set(false);
          this.visibleModal.set(false);
          this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: 'Položka byla uložena!' });
          this.updated.emit();
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

  private initializedItemForm() {
    this.unitForm = new FormGroup({
      'amount': new FormControl({
        value: this.selectedUnit()?.amount,
        disabled: false
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
