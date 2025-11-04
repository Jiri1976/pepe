import { Component, computed, DestroyRef, ElementRef, inject, input, model, signal, viewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { WarehouseItem } from '../../../models/warehouse/warehouse-item.interface';
import { tap } from 'rxjs';
import { WarehouseService } from '../../../services/warehouse.service';
import { NotificationComponent } from "../../notification/notification.component";
import { ToasterService } from '../../../services/toaster.service';
import { SignalService } from '../../../services/signal.service';

@Component({
  selector: 'app-widget-update',
  imports: [ReactiveFormsModule, NotificationComponent],
  templateUrl: './widget-update.component.html',
  styleUrl: './widget-update.component.scss'
})
export class WidgetUpdateComponent {
  private warehouseService = inject(WarehouseService);
  private signalService = inject(SignalService);
  private toaster = inject(ToasterService);
  private destroyRef = inject(DestroyRef);
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
      position: this.item().position
    }
    this.isLoading.set(true);
    const subscription = this.warehouseService.updateWarehouseItem(newItem).pipe(
      tap(response => {
        if (response === null) {
          this.toaster.error('Něco se pokazilo, zkus to znovu.');
          this.isLoading.set(false);
        } else if (response.isSuccess === false) {
          this.isLoading.set(false);
          this.toaster.error(response.errorMessage);
        } else if (response.isSuccess) {
          let _items = [...this.items()];
          let updatedItem = _items.find(x => x.id === this.item().id);
          updatedItem!.name = this.itemForm.get('name')?.value;
          this.warehouseService.setItems(_items);
          this.updateVisible.set(false);
          this.signalService.sendCards('F-M', false, true);
          this.isLoading.set(false);
          this.toaster.success('Položka byla upravena!');
        }
      }),

    ).subscribe({
      next: () => {

      },
      error: () => this.isLoading.set(false)
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
}