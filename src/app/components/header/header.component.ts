import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { NotificationMessagesComponent } from '../notification-messages/notification-messages.component';
import { AuthStore } from '../../stores/auth-store/auth.store';
import { SignalRStore } from '../../stores/signalr-store/signalr.store';
import { MobileNavigationService } from '../../services/mobile-navigation.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly authStore = inject(AuthStore);
  readonly signalRStore = inject(SignalRStore);
  private readonly mobileNavigation = inject(MobileNavigationService);
  private dialog = inject(Dialog);
  private readonly router = inject(Router);
  user = computed(() => this.authStore.user());
  notifications = computed(() => this.signalRStore.notifications());
  isShown = computed(() => this.mobileNavigation.activeMenu() === 'main');
  planActionsOpen = computed(
    () => this.mobileNavigation.activeMenu() === 'plan-actions',
  );
  shiftActionsOpen = computed(
    () => this.mobileNavigation.activeMenu() === 'shift-actions',
  );
  warehouseActionsOpen = computed(
    () => this.mobileNavigation.activeMenu() === 'warehouse-actions',
  );

  ngOnInit() {
    this.mobileNavigation.close();
  }

  onOpenNotifications() {
    this.dialog.open(NotificationMessagesComponent, { disableClose: false });
  }

  onLogout() {
    this.mobileNavigation.close();
    this.authStore.logOut();
  }

  toggle() {
    this.mobileNavigation.toggle('main');
  }

  isPlansPage() {
    return this.router.url.split('?')[0] === '/plans';
  }

  togglePlanActions() {
    this.mobileNavigation.toggle('plan-actions');
  }

  isShiftsPage() {
    const path = this.router.url.split('?')[0];
    return path === '/shifts' || path.startsWith('/shifts/');
  }

  toggleShiftActions() {
    this.mobileNavigation.toggle('shift-actions');
  }

  isWarehousePage() {
    return this.router.url.split('?')[0].startsWith('/warehouse');
  }

  toggleWarehouseActions() {
    this.mobileNavigation.toggle('warehouse-actions');
  }

  closeMobileNavigation() {
    this.mobileNavigation.close();
  }

}
