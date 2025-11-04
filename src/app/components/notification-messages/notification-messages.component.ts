import { Component, computed, inject } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { ToasterService } from '../../services/toaster.service';

@Component({
  selector: 'app-notification-messages',
  imports: [],
  templateUrl: './notification-messages.component.html',
  styleUrl: './notification-messages.component.scss'
})
export class NotificationMessagesComponent {
  private toaster = inject(ToasterService);
  private dialogRef = inject(DialogRef, { optional: true });
  notifications = computed(() => this.toaster.notifications());

  removeNotification(index: number) {
    this.toaster.removeNotifications(index);
    if (this.notifications.length === 0) {
      this.dialogRef?.close();
    }
  }

  closeModal() {
    this.dialogRef?.close();
  }
}
