import { Component, inject, input, model, signal } from '@angular/core';
import { WarehouseItem } from '../../../models/warehouse/warehouse-item.interface';
import { WarehouseStore } from '../../../stores/warehouse-store/warehouse.store';
import { WarehouseItemForm } from '../../../stores/warehouse-store/warehouse.helpers';
import { form, FormField, required, validate } from '@angular/forms/signals';

@Component({
  selector: 'app-widget-update',
  imports: [FormField],
  templateUrl: './widget-update.component.html',
  styleUrl: './widget-update.component.scss'
})
export class WidgetUpdateComponent {
  readonly store = inject(WarehouseStore);
  item = input.required<WarehouseItem>();
  updateVisible = model<boolean>(false);
  warehouseItemModel = signal<WarehouseItemForm>({
    name: ''
  });

  readonly form = form(this.store.warehouseItemModel, s => {
    required(s.name, { message: 'Název položky je povinný' });
    validate(s.name, field =>
      (field.value()?.length ?? 0) > 30
        ? { kind: 'maxLength', message: 'Prosím pouze 30 znaků' }
        : null
    );
  });

  ngOnInit() {
    this.form.name().value.set(this.item().name);
  }

  ngAfterViewInit() {
    this.form.name().focusBoundControl();
  }

  onClose() {
    this.updateVisible.set(false);
  }

  onSave(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.form.name().invalid()) {
      return;
    }

    const newItem: WarehouseItem = {
      id: this.item().id,
      name: this.form.name().value(),
      position: this.item().position
    }
    this.store.updateWarehouseItem(newItem);
    this.updateVisible.set(false);
  }

}