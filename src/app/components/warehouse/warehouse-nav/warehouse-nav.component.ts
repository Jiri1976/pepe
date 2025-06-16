import { Component, computed, inject, model, signal, ViewChild } from '@angular/core';
import { WarehouseComponent } from '../../../pages/warehouse/warehouse.component';
import { WarehouseService } from '../../../services/warehouse.service';
import { HideElementDirective } from '../../../directives/hide-element.directive';
import { HideWhenAdminDirective } from '../../../directives/hide-when-admin.directive';
import { WarehouseItemsComponent } from '../warehouse-items/warehouse-items.component';
import { AuthService } from '../../../services/auth.service';
import { PageAnimation } from '../../../animations/page.animation';

@Component({
  selector: 'app-warehouse-nav',
  imports: [HideElementDirective, HideWhenAdminDirective],
  templateUrl: './warehouse-nav.component.html',
  styleUrl: './warehouse-nav.component.scss',
  animations: [
    PageAnimation
  ]
})
export class WarehouseNavComponent {
  private authService = inject(AuthService);
  private warehouseService = inject(WarehouseService);
  private _warehouseItemsComp: WarehouseItemsComponent | undefined;
  loggedUser = this.authService.getUser();
  warehouseComp = inject(WarehouseComponent);
  isOpened = signal(true);
  warehouseItemsVisible = model(false);
  unitsActive = model(true);
  calendarText = model('');
  destination = model<string>('F-M');
  pdfLoading = model(false);
  items = computed(() => this.warehouseService.items());
  @ViewChild(WarehouseItemsComponent)
  set warehouseItemsComp(comp: WarehouseItemsComponent | undefined) {
    this._warehouseItemsComp = comp;
  }

  onOpen() {
    if (this.unitsActive()) {
      if (this.warehouseComp.cards.length === 0) {
        return;
      }
      this.warehouseComp.onReloadCards();
    }
  }

  onShowList() {
    this.warehouseService.visibleList.set(true);
  }

  onDeleteCards() {
    this.warehouseComp.onDeleteCards(this.destination());
  }

  onAddItem() {
    this.warehouseService.callOnAddItem();
  }

  onOpenMasterAdd() {
    this.warehouseComp.masterAddVisible.set(true);
  }
}