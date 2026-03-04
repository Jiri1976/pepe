import { Component, inject, input, signal } from '@angular/core';
import { WidgetUpdateComponent } from "../widget-update/widget-update.component";
import { CdkDrag, CdkDragPlaceholder } from '@angular/cdk/drag-drop';
import { WarehouseItem } from '../../../models/warehouse/warehouse-item.interface';
import { WidgetAddComponent } from "../widget-add/widget-add.component";
import { WarehouseStore } from '../../../stores/warehouse-store/warehouse.store';

@Component({
  selector: 'app-widget',
  imports: [WidgetUpdateComponent, CdkDrag, CdkDragPlaceholder, WidgetAddComponent],
  templateUrl: './widget.component.html',
  styleUrl: './widget.component.scss'
})
export class WidgetComponent {
  readonly store = inject(WarehouseStore);
  updateVisible = signal(false);
  item = input.required<WarehouseItem>();
  index = input.required<number>();

  onUpdate() {
    this.updateVisible.set(true);
  }

  onDelete() {
    if (this.item().id <= 0) {
      this.store.removeWarehouseItem(this.item());
    } else {
      this.store.requestDeleteWarehouseItem(this.item());
    }
  }
}
