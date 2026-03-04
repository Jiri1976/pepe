import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogRef } from '@angular/cdk/dialog';
import { WarehouseStore } from '../../../stores/warehouse-store/warehouse.store';

@Component({
  selector: 'app-items-list',
  imports: [ButtonModule],
  templateUrl: './items-list.component.html',
  styleUrl: './items-list.component.scss'
})
export class ItemsListComponent {
  readonly store = inject(WarehouseStore);
  private dialogRef = inject(DialogRef, { optional: true });
  items = this.store.unitItems;

  onSelectItem(index: number) {
    this.store.slideTo(index);
    this.dialogRef?.close();
  }

  protected closeModal() {
    this.dialogRef?.close();
  }
}
