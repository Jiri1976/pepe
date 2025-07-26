import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { WarehouseService } from '../../../services/warehouse.service';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-items-list',
  imports: [DialogModule, ButtonModule],
  templateUrl: './items-list.component.html',
  styleUrl: './items-list.component.scss'
})
export class ItemsListComponent implements OnInit {
  private warehouseService = inject(WarehouseService);
  private dialogRef = inject(DialogRef, { optional: true });
  cards = computed(() => this.warehouseService.cards());
  items = signal<{
    name: string;
    id: number;
  }[]>([]);

  ngOnInit(): void {
    this.getItems();
  }

  onSelectItem(itemId: number) {
    this.warehouseService.selectedListItemId.set(itemId);
    this.dialogRef?.close();
  }

  protected closeModal() {
    this.dialogRef?.close();
  }

  private getItems() {
    if (this.cards().length > 0) {
      let _items: {
        name: string;
        id: number;
      }[] = [];
      this.cards().forEach(card => {
        _items.push({ name: card.warehouseItemName, id: card.warehouseItemId });
      });
      this.items.set(_items);
    }
  }
}
