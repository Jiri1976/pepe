import { Component, computed, inject, input, model, signal } from '@angular/core';
import { WidgetUpdateComponent } from "../widget-update/widget-update.component";
import { CdkDrag, CdkDragPlaceholder } from '@angular/cdk/drag-drop';
import { WarehouseItem } from '../../../models/warehouse/warehouse-item.interface';
import { WarehouseService } from '../../../services/warehouse.service';
import { WidgetAddComponent } from "../widget-add/widget-add.component";
import { WarehouseItemsComponent } from '../warehouse-items/warehouse-items.component';
import { FastPageAnimation } from '../../../animations/fast-page.animation';

@Component({
  selector: 'app-widget',
  imports: [WidgetUpdateComponent, CdkDrag, CdkDragPlaceholder, WidgetAddComponent],
  templateUrl: './widget.component.html',
  styleUrl: './widget.component.scss',
  animations: [
    FastPageAnimation
  ]
})
export class WidgetComponent {
  private warehouseService = inject(WarehouseService);
  private warehouseItems = inject(WarehouseItemsComponent);
  updateVisible = signal(false);
  item = input.required<WarehouseItem>();
  index = input.required<number>();
  items = computed(() => this.warehouseService.items());
  selected = model<WarehouseItem>();
  isDragged = model<boolean>(false);

  onUpdate() {
    this.updateVisible.set(true);
  }

  onDragMoved(item: WarehouseItem) {
    this.selected.set(item);
    this.isDragged.set(true);
  }

  onDragEnded(event: any) {
    this.isDragged.set(false);
  }

  onDelete() {
    this.warehouseItems.onDelete(this.item());
  }
}
