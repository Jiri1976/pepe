import { Component, inject, input } from '@angular/core';
import { WarehouseItem } from '../../../models/warehouse/warehouse-item.interface';
import { WarehouseStore } from '../../../stores/warehouse-store/warehouse.store';
import { form, FormField } from '@angular/forms/signals';
import { buildWarehouseItem } from '../../../stores/warehouse-store/warehouse.helpers';


@Component({
  selector: 'app-widget-add',
  imports: [FormField],
  templateUrl: './widget-add.component.html',
  styleUrl: './widget-add.component.scss'
})
export class WidgetAddComponent {
  readonly store = inject(WarehouseStore);
  item = input.required<WarehouseItem>();

  readonly form = form(this.store.warehouseItemModel, s => {
    buildWarehouseItem(s);
  });

  ngOnInit() {
    this.form.name().value.set('');
  }

  ngAfterViewInit() {
    this.form.name().focusBoundControl();
  }

  onSave(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.form.name().value() === '') {
      return;
    }
    const newItem: WarehouseItem = {
      id: 0,
      name: this.form.name().value(),
      position: 1
    }
    this.store.createWarehouseItem(newItem);
  }

  onDelete() {
    this.store.removeWarehouseItem(this.item());
  }
}
