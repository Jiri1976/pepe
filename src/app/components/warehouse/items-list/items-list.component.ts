import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { WarehouseService } from '../../../services/warehouse.service';

@Component({
  selector: 'app-items-list',
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './items-list.component.html',
  styleUrl: './items-list.component.scss'
})
export class ItemsListComponent {
  private warehouseService = inject(WarehouseService);
  visible = computed(() => this.warehouseService.visibleList());
  items = input.required<{
    name: string;
    id: number;
  }[]>();
  selected = output<number>();

  onSelectItem(itemId: number) {
    this.selected.emit(itemId);
  }
}
