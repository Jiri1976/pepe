import { Component, computed, effect, inject } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { SignalRStore } from '../../stores/signalr-store/signalr.store';

@Component({
  selector: 'app-notification-messages',
  imports: [],
  templateUrl: './notification-messages.component.html',
  styleUrl: './notification-messages.component.scss'
})
export class NotificationMessagesComponent {
  readonly store = inject(SignalRStore);
  private dialogRef = inject(DialogRef, { optional: true });
  notifications = computed(() => this.store.notifications());

  removeNotification(index: number) {
    this.store.removeNotifications(index);
    if (this.notifications().length === 0) {
      this.dialogRef?.close();
    }
  }

  closeModal() {
    this.dialogRef?.close();
  }
}
