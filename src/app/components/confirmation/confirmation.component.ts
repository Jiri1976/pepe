import { Component, input, model, output } from '@angular/core';

@Component({
  selector: 'app-confirmation',
  imports: [],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.scss',
})
export class ConfirmationComponent {
  text = input.required<string>();
  confirmationOpened = model<boolean>(false);
  confirmed = output<void>();

  onCancel() {
    this.confirmationOpened.set(false);
  }
}
