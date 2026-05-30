import { Component, inject, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ConfirmationStore } from '../../stores/custome-features/withConfirmation/confirmation.store';

@Component({
  selector: 'app-confirmation',
  imports: [],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.scss',
})
export class ConfirmationComponent {
  private readonly confirmationStore = inject(ConfirmationStore);

  constructor(
    @Inject(DIALOG_DATA) public data: { action: string; text: string },
    private dialogRef: DialogRef<boolean>,
  ) {}

  confirm() {
    this.confirmationStore.confirm();
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
    this.confirmationStore.cancel();
  }
}
