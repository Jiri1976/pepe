import { Component, input, output } from '@angular/core';
import { GetUserDTO } from '../../../models/users/getUserDTO.interface';

@Component({
  selector: 'app-user-item',
  imports: [],
  templateUrl: './user-item.component.html',
  styleUrl: './user-item.component.scss'
})
export class UserItemComponent {
  user = input.required<GetUserDTO>();
  selectedId = output<number>();

  editUser(id: number) {
    this.selectedId.emit(id);
  }
}