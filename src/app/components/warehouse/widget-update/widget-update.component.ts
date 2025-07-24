import { Component, computed, DestroyRef, ElementRef, inject, input, model, signal, viewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { WarehouseItem } from '../../../models/warehouse/warehouse-item.interface';
import { tap } from 'rxjs';
import { AlertService } from '../../../services/alert.service';
import { ErrorHandlingService } from '../../../services/error-handling.service';
import { WarehouseService } from '../../../services/warehouse.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationComponent } from "../../notification/notification.component";
import { WarehouseItemsComponent } from '../warehouse-items/warehouse-items.component';

@Component({
  selector: 'app-widget-update',
  imports: [ReactiveFormsModule, NotificationComponent],
  templateUrl: './widget-update.component.html',
  styleUrl: './widget-update.component.scss'
})
export class WidgetUpdateComponent {
  private warehouseService = inject(WarehouseService);
  private errorHandlingService = inject(ErrorHandlingService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  private warehouseItemsComp = inject(WarehouseItemsComponent);
  itemForm!: FormGroup;
  item = input.required<WarehouseItem>();
  updateVisible = model<boolean>(false);
  isLoading = signal<boolean>(false);
  items = computed(() => this.warehouseService.items());
  inputField = viewChild<ElementRef>('input');

  get name() {
    return this.itemForm.get('name');
  }

  ngOnInit() {
    this.initializedItemForm();
  }

  ngAfterViewInit() {
    this.inputField()?.nativeElement.focus();
  }

  onClose() {
    this.updateVisible.set(false)
    this.itemForm.reset();
  }

  onSave() {
    if (this.name?.value === '') {
      return;
    }

    const newItem: WarehouseItem = {
      id: this.item().id,
      name: this.itemForm.get('name')?.value,
      shortName: 'XXL',
      position: this.item().position
    }
    this.isLoading.set(true);
    const subscription = this.warehouseService.updateWarehouseItem(newItem).pipe(
      tap(response => {
        if (response === null) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
          this.isLoading.set(false);
        } else if (response.isSuccess === false) {
          this.isLoading.set(false);
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else if (response.isSuccess) {
          let _items = [...this.items()];
          let updatedItem = _items.find(x => x.id === this.item().id);
          updatedItem!.name = this.itemForm.get('name')?.value;
          this.warehouseService.setItems(_items);
          this.updateVisible.set(false);
          this.warehouseService.sendCards('F-M', false, true);
          this.isLoading.set(false);
          this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: 'Položka byla upravena!' });
        }
      }),

    ).subscribe({
      next: () => {

      },
      error: error => this.handleError(error)
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  private initializedItemForm() {
    this.itemForm = new FormGroup({
      'name': new FormControl({
        value: this.item().name,
        disabled: false
      }, [
        Validators.required,
        Validators.maxLength(30)
      ]
      ),
    });
  }

  private handleError = (errorRes: HttpErrorResponse) => {
    this.isLoading.set(false);
    return this.errorHandlingService.handleError(errorRes);
  };
}