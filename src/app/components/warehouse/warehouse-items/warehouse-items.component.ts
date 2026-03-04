import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { WidgetComponent } from "../widget/widget.component";
import { CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { WarehouseItem } from '../../../models/warehouse/warehouse-item.interface';
import { ToasterService } from '../../../services/toaster.service';
import { WarehouseStore } from '../../../stores/warehouse-store/warehouse.store';

@Component({
  selector: 'app-warehouse-items',
  imports: [WidgetComponent, CdkDropList],
  templateUrl: './warehouse-items.component.html',
  styleUrl: './warehouse-items.component.scss'
})
export class WarehouseItemsComponent implements OnInit {
  readonly store = inject(WarehouseStore);
  private toaster = inject(ToasterService);
  items = this.store.warehouseItems;
  height = signal(window.innerHeight);

  bodyStyles = computed(() => {
    const shouldScroll =
      this.items()?.length > 11 && this.height() < 700;

    return shouldScroll
      ? { maxHeight: '550px', overflowY: 'auto' }
      : {};
  });

  @HostListener('window:resize')
  onResize() {
    this.height.set(window.innerHeight);
  }

  ngOnInit() {
    this.store.setWarehouseNave('items');
    this.store.getWarehouseItems();
  }

  drop(event: CdkDragDrop<WarehouseItem[]>) {
    const items = [...this.items()];

    if (items.some(i => i.id <= 0)) {
      this.toaster.error('Nejdříve ulož položku!');
      return;
    }

    if (event.previousIndex === event.currentIndex) return;

    moveItemInArray(items, event.previousIndex, event.currentIndex);

    const normalized = items.map((item, index) => ({
      ...item,
      position: index + 1
    }));

    this.store.reorderWarehouseItems(normalized);
  }
}