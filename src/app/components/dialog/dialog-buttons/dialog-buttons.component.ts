import { Component, inject, input, output } from '@angular/core';
import { DialogComponent } from '../dialog.component';

@Component({
  selector: 'app-dialog-buttons',
  imports: [],
  templateUrl: './dialog-buttons.component.html',
  styleUrl: './dialog-buttons.component.scss'
})
export class DialogButtonsComponent {
  label = input('OK');
  isConfirm = input(false);
  onClick = output();
  private dialog = inject(DialogComponent, { optional: true });

  protected handleClick() {
    this.onClick.emit();
    this.dialog?.close(this.isConfirm());
  }
}
