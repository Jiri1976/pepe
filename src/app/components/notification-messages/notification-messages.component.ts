import { Component, computed, inject } from '@angular/core';
import { AlertService } from '../../services/alert.service';
import { DialogRef } from '@angular/cdk/dialog';
import { FastPageAnimation } from '../../animations/fast-page.animation';

@Component({
  selector: 'app-notification-messages',
  imports: [],
  templateUrl: './notification-messages.component.html',
  styleUrl: './notification-messages.component.scss',
  animations: [
    FastPageAnimation,
  ]
})
export class NotificationMessagesComponent {
  private alertService = inject(AlertService);
  private dialogRef = inject(DialogRef, { optional: true });
  notifications = computed(() => this.alertService.notifications());

  removeNotification(index: number) {
    this.alertService.removeNotifications(index);
    if (this.notifications.length === 0) {
      this.dialogRef?.close();
    }
  }

  closeModal() {
    this.dialogRef?.close();
  }
}
