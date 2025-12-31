import { Component, inject, output } from '@angular/core';
import { ConfirmationStore } from '../../stores/confirmation-store/confirmation.store';

@Component({
  selector: 'app-confirmation',
  imports: [],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.scss',
})
export class ConfirmationComponent {
  readonly confirmation = inject(ConfirmationStore);
  confirmed = output<void>();
}
