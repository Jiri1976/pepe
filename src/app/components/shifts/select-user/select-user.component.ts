import { Component, input, InputSignal, model, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';


interface Users {
  userName: string;
  userId: number;
}

@Component({
  selector: 'app-select-user',
  imports: [DialogModule, ButtonModule],
  templateUrl: './select-user.component.html',
  styleUrl: './select-user.component.scss'
})
export class SelectUserComponent {
  visibleModal = model<boolean>(false);
  users: InputSignal<Users[]> = input.required<Users[]>();
  selected = output<number>();

  onSelectUser(userId: number) {
    this.visibleModal.set(false)
    this.selected.emit(userId);
  }
}
