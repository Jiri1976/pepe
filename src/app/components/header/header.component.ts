import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { PageAnimation } from '../../animations/page.animation';
import { HideElementDirective } from '../../directives/hide-element.directive';
import { AlertService } from '../../services/alert.service';
import { Dialog } from '@angular/cdk/dialog';
import { NotificationMessagesComponent } from '../notification-messages/notification-messages.component';

@Component({
  selector: 'app-header',
  imports: [ButtonModule, RouterLink, HideElementDirective],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  animations: [
    PageAnimation
  ]
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private dialog = inject(Dialog)
  user = computed(() => this.authService.user());
  notifications = computed(() => this.alertService.notifications());

  ngOnInit(): void {
    let messages: any[] = [];
    let localStorageMessages = localStorage.getItem("notifications");
    if (localStorageMessages) {
      messages = JSON.parse(localStorageMessages);
    }
    this.alertService.notifications.set(messages);
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
