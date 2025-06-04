import { Component, DestroyRef, inject, input, model, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { WarehouseCard } from '../../../models/warehouse/warehouse-card.interface';
import { FormGroup, FormControl, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { map } from 'rxjs';
import { ErrorHandlingService } from '../../../services/error-handling.service';
import { WarehouseService } from '../../../services/warehouse.service';
import { AlertService } from '../../../services/alert.service';
import { WarehouseComponent } from '../../../pages/warehouse/warehouse.component';

@Component({
  selector: 'app-master-add',
  imports: [DialogModule, ButtonModule, ReactiveFormsModule],
  templateUrl: './master-add.component.html',
  styleUrl: './master-add.component.scss'
})
export class MasterAddComponent implements OnInit {
  private errorHandlingService = inject(ErrorHandlingService);
  private warehouseService = inject(WarehouseService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  private warehouseComponent = inject(WarehouseComponent);
  masterAddVisible = model(false);
  cards = input.required<WarehouseCard[]>();
  warehouseItems: {
    name: string;
    id: number;
  }[] = [];
  warehouseForm!: FormGroup;
  today = new Date();
  day = this.today.getDate() < 10 ? `0${this.today.getDate()}` : `${this.today.getDate()}`;
  month = this.today.getMonth() + 1 < 10 ? `0${this.today.getMonth() + 1}` : `${this.today.getMonth() + 1}`;
  year = this.today.getFullYear();
  todayDate = `${this.day}.${this.month}.${this.year}`;
  isLoading = signal(false);

  get items() {
    return this.warehouseForm.get("items") as FormArray;
  }

  ngOnInit() {
    this.getItems();
    this.initializedWarehouseForm();
  }

  onClose() {
    this.masterAddVisible.set(false);
  }

  onSave() {
    if (!this.warehouseForm.valid) {
      return;
    }
    let controls: any = this.items.controls;
    let _cards = [...this.cards()];
    controls.forEach((control: any) => {
      let warehouseItemId = control.controls['warehouseItemId'].value;
      let value = control.controls['amount'].value;
      let card = _cards.find(c => c.warehouseItemId === warehouseItemId);
      let unit = card!.units.find(u => u.date === this.todayDate);
      unit!.amount = value;
    });

    this.isLoading.set(true);
    const subscription = this.warehouseService.updateWarehouseCards(_cards).pipe(
      map(response => {
        if (response === null) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
          this.isLoading.set(false);
        } else if (response.isSuccess === false) {
          this.isLoading.set(false);
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else if (response.isSuccess) {
          this.warehouseComponent.onReloadCards();
          this.isLoading.set(false);
          this.masterAddVisible.set(false);
          this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: 'Karty byly aktualizovány.' });
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
      this.warehouseItems.push({ name: card.warehouseItemName, id: card.warehouseItemId });
    });
  }

  private initializedWarehouseForm() {
    this.warehouseForm = new FormGroup({
      'items': new FormArray([]),
    });

    this.cards().forEach(card => {
      (<FormArray>this.warehouseForm.get('items')).push(new FormGroup({
        'warehouseItemId': new FormControl({
          value: card.warehouseItemId,
          disabled: true
        }),
        'amount': new FormControl({
          value: card.units.find(u => u.date === this.todayDate)?.amount,
          disabled: false
        }, [
          Validators.pattern("^[0-9]*$")
        ]
        )
      }))
    });
  }

  private handleError = (errorRes: HttpErrorResponse) => {
    this.isLoading.set(false);
    return this.errorHandlingService.handleError(errorRes);
  };
}