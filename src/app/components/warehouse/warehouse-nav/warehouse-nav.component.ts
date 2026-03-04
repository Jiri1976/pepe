import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { HideElementDirective } from '../../../directives/hide-element.directive';
import { HideWhenAdminDirective } from '../../../directives/hide-when-admin.directive';
import { Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { ItemsListComponent } from '../items-list/items-list.component';
import { WarehouseStore } from '../../../stores/warehouse-store/warehouse.store';

@Component({
  selector: 'app-warehouse-nav',
  imports: [HideElementDirective, HideWhenAdminDirective],
  templateUrl: './warehouse-nav.component.html',
  styleUrl: './warehouse-nav.component.scss'
})
export class WarehouseNavComponent {
  readonly store = inject(WarehouseStore);
  private router = inject(Router);
  private dialog = inject(Dialog);
  items = this.store.warehouseItems;
  @ViewChild('toggleBtn', { static: false })
  toggleBtn!: ElementRef<HTMLElement>;

  onShowList() {
    this.dialog.open(ItemsListComponent, { disableClose: false });
  }

  onShowItems() {
    this.router.navigate(['warehouse', 'warehouse-items']);
  }

  onShowUnits() {
    this.router.navigate(['warehouse', 'warehouse-units']);
  }

  onShowBoard() {
    this.router.navigate(['warehouse']);
  }

  onToggleCalendar(event: MouseEvent) {
    event.stopPropagation();
    this.store.toggleCalendar();
  }
}