import { Component, computed, effect, inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { AlertService } from '../../services/alert.service';
import { MessageService } from "primeng/api"

@Component({
  selector: 'app-alert',
  imports: [ToastModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
  providers: []
})
export class AlertComponent {
  private alertService = inject(AlertService);
  private messageService = inject(MessageService);
  alert = computed(() => this.alertService.alert());

  constructor() {
    effect(() => {
      if (this.alert().summary !== '') {
        this.messageService.add({ key: 'confirm', severity: this.alert().severity, detail: this.alert().detail, sticky: this.alert().severity === 'info' });
      }
    });
  }

  onReject() {
    this.messageService.clear();
  }

}
