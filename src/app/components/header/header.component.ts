import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HideElementDirective } from '../../directives/hide-element.directive';
import { Dialog } from '@angular/cdk/dialog';
import { NotificationMessagesComponent } from '../notification-messages/notification-messages.component';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { AuthStore } from '../../stores/auth-store/auth.store';
import { SignalRStore } from '../../stores/signalr-store/signalr.store';

@Component({
  selector: 'app-header',
  imports: [RouterLink, HideElementDirective, ClickOutsideDirective],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly signalRStore = inject(SignalRStore);
  private dialog = inject(Dialog)
  private router = inject(Router);
  notifications = computed(() => this.signalRStore.notifications());
  isShown = signal(false);
  initialized = signal(false);

  ngOnInit(): void {
    this.initialized.set(true);
  }

  onOpenNotifications() {
    this.dialog.open(NotificationMessagesComponent, { disableClose: false });
  }

  onLogout() {
    this.authStore.logOut();
  }

  toggle() {
    this.isShown.update((isShown) => !isShown);
  }

  navigate(url: string) {
    this.close();
    this.router.navigateByUrl(url);
  }

  close() {
    this.isShown.set(false);
  }
}
