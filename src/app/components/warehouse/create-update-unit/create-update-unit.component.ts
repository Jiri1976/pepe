import { CommonModule } from '@angular/common';
import { Component, input, InputSignal, model, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

interface Users {
  userName: string;
  userId: number;
}

@Component({
  selector: 'app-create-update-unit',
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './create-update-unit.component.html',
  styleUrl: './create-update-unit.component.scss'
})
export class CreateUpdateUnitComponent {
  visibleModal = model<boolean>(false);
  // users: InputSignal<Users[]> = input.required<Users[]>();
  selected = output<number>();

  onSelectUser(userId: number) {
    this.visibleModal.set(false)
    this.selected.emit(userId);
  }
}
