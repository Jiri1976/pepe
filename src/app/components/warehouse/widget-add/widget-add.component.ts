import { Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { WarehouseItem } from '../../../models/warehouse/warehouse-item.interface';
import { WarehouseService } from '../../../services/warehouse.service';
import { tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlingService } from '../../../services/error-handling.service';
import { AlertService } from '../../../services/alert.service';
import { SpinnerComponent } from "../../spinner/spinner.component";
import { NotificationComponent } from "../../notification/notification.component";

@Component({
  selector: 'app-widget-add',
  imports: [ReactiveFormsModule, SpinnerComponent, NotificationComponent],
  templateUrl: './widget-add.component.html',
  styleUrl: './widget-add.component.scss'
})
export class WidgetAddComponent {
  private warehouseService = inject(WarehouseService);
  private errorHandlingService = inject(ErrorHandlingService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  itemForm!: FormGroup;
  position = input.required<number>();
  items = computed(() => this.warehouseService.items());
  isLoading = signal<boolean>(false);

  ngOnInit() {
    this.initializedItemForm();
  }

  onSave() {
    const newItem: WarehouseItem = {
      id: 0,
      name: this.itemForm.get('name')?.value,
      shortName: 'XXL',
      position: this.position()
    }

    const subscription = this.warehouseService.createWarehouseItem(newItem).pipe(
      tap(response => {
        if (response === null) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
          this.isLoading.set(false);
        } else if (response.isSuccess === false) {
          this.isLoading.set(false);
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else if (response.isSuccess) {
          let _items = [...this.items()];
          _items = _items.filter(i => i.position !== this.position());
          _items.push(response.result);
          this.warehouseService.setItems(_items);
          this.isLoading.set(false);
          this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: 'Položka byla uložena!' });
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
        value: '',
        disabled: false
      }, [
        Validators.required,
        Validators.maxLength(30)
      ]
      )
    });
  }

  private handleError = (errorRes: HttpErrorResponse) => {
    return this.errorHandlingService.handleError(errorRes);
  };
}
