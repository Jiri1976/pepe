import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HideElementDirective } from '../../directives/hide-element.directive';
import { Dialog } from '@angular/cdk/dialog';
import { NotificationMessagesComponent } from '../notification-messages/notification-messages.component';
import { ToasterService } from '../../services/toaster.service';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { AuthStore } from '../../stores/auth-store/auth.store';

@Component({
  selector: 'app-header',
  imports: [RouterLink, HideElementDirective, ClickOutsideDirective],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  private toaster = inject(ToasterService);
  private dialog = inject(Dialog)
  private router = inject(Router);
  notifications = computed(() => this.toaster.notifications());
  isShown = signal(false);

  ngOnInit(): void {
    let messages: any[] = [];
    let localStorageMessages = localStorage.getItem("notifications");
    if (localStorageMessages) {
      messages = JSON.parse(localStorageMessages);
    }
    this.toaster.notifications.set(messages);
  }

  constructor() {
    effect(() => { });
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
    this.toggle();
    this.router.navigateByUrl(url);
  }
}
