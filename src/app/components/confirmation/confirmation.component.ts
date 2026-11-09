import { Component, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-confirmation',
  imports: [],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.scss',
})
export class ConfirmationComponent {
  constructor(
    @Inject(DIALOG_DATA) public data: { text: string },
    private dialogRef: DialogRef<boolean>,
  ) {}

  closeModal(confirmed: boolean) {
    this.dialogRef.close(confirmed);
  }
}
