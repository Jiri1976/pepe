import { Component, input, output, signal } from '@angular/core';
import { DialogContentComponent } from "./dialog-content/dialog-content.component";

@Component({
  selector: 'app-dialog',
  imports: [DialogContentComponent],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {
  username = input.required<string>();
  onClose = output<void>();
  onConfirm = output<void>();
  protected closed = signal(false);

  close(confirm = false) {
    this.onClose.emit();
    this.closed.set(true);

    if (confirm) {
      this.onConfirm.emit();
    }
  }
}
