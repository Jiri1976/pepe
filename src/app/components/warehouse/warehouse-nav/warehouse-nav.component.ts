import { Component, computed, inject, model, signal } from '@angular/core';
import { WarehouseComponent } from '../../../pages/warehouse/warehouse.component';
import { WarehouseService } from '../../../services/warehouse.service';
import { HideElementDirective } from '../../../directives/hide-element.directive';
import { HideWhenAdminDirective } from '../../../directives/hide-when-admin.directive';
import { AuthService } from '../../../services/auth.service';
import { PageAnimation } from '../../../animations/page.animation';
import { Router } from '@angular/router';

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
  private router = inject(Router);
  loggedUser = this.authService.getUser();
  warehouseComp = inject(WarehouseComponent);
  isOpened = signal(true);
  unitsActive = signal(true);
  calendarText = model('');
  destination = computed(() => this.warehouseService.destination());
  pdfLoading = model(false);
  items = computed(() => this.warehouseService.items());
  cards = computed(() => this.warehouseService.cards());

  onShowList() {
    this.warehouseService.visibleList.set(true);
  }

  onDeleteCards() {
    this.warehouseService.deleteCards.set(true);
  }

  onAddItem() {
    this.warehouseService.callOnAddItem();
  }

  onOpenMasterAdd() {
    this.warehouseService.masterAddVisible.set(true);
  }

  onShowItems() {
    this.unitsActive.set(false);
    this.router.navigate(['warehouse', 'warehouse-items']);
  }

  onShowUnits() {
    this.unitsActive.set(true);
    this.router.navigate(['warehouse']);
  }

  onReloadItems() {
    this.warehouseService.reloadItems.set(true);
  }

  onSelectDestination(destination: string) {
    this.warehouseService.destination.set(destination);
    this.warehouseService.reloadCards.set(true);
  }

  onReloadCards() {
    this.warehouseService.reloadCards.set(true);
  }
}