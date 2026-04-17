import { Component, computed, effect, inject } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { AuthStore } from '../../stores/auth-store/auth.store';

@Component({
  selector: 'app-notification-messages',
  imports: [],
  templateUrl: './notification-messages.component.html',
  styleUrl: './notification-messages.component.scss'
})
export class NotificationMessagesComponent {
  readonly store = inject(AuthStore);
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
