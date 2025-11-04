import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { HideElementDirective } from '../../directives/hide-element.directive';
import { Dialog } from '@angular/cdk/dialog';
import { NotificationMessagesComponent } from '../notification-messages/notification-messages.component';
import { ToasterService } from '../../services/toaster.service';

@Component({
  selector: 'app-header',
  imports: [ButtonModule, RouterLink, HideElementDirective],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private toaster = inject(ToasterService);
  private dialog = inject(Dialog)
  user = computed(() => this.authService.user());
  notifications = computed(() => this.toaster.notifications());

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
    this.authService.logout();
  }
}
