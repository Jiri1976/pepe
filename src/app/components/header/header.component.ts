import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { NotificationMessagesComponent } from '../notification-messages/notification-messages.component';
import { AuthStore } from '../../stores/auth-store/auth.store';
import { SignalRStore } from '../../stores/signalr-store/signalr.store';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly authStore = inject(AuthStore);
  readonly signalRStore = inject(SignalRStore);
  private dialog = inject(Dialog);
  user = computed(() => this.authStore.user());
  notifications = computed(() => this.signalRStore.notifications());
  isShown = signal(false);

  ngOnInit() {
    this.isShown.set(false);
  }

  onOpenNotifications() {
    this.dialog.open(NotificationMessagesComponent, { disableClose: false });
  }

  onLogout() {
    this.isShown.update((isShown) => false);
    this.authStore.logOut();
  }

  toggle() {
    this.isShown.update((isShown) => !isShown);
  }
}
