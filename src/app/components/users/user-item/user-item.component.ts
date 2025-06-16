import { Component, input, output } from '@angular/core';
import { GetUserDTO } from '../../../models/users/getUserDTO.interface';
import { PageAnimation } from '../../../animations/page.animation';

@Component({
  selector: 'app-user-item',
  imports: [],
  templateUrl: './user-item.component.html',
  styleUrl: './user-item.component.scss',
  animations: [
    PageAnimation
  ]
})
export class UserItemComponent {
  user = input.required<GetUserDTO>();
  selectedId = output<number>();

  editUser(id: number) {
    this.selectedId.emit(id);
  }
}