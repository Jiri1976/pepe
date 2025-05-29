import { Component, inject, input, output } from '@angular/core';
import { GetUserDTO } from '../../../models/users/getUserDTO.interface';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-user-item',
  imports: [],
  templateUrl: './user-item.component.html',
  styleUrl: './user-item.component.scss'
})
export class UserItemComponent {
  private usersService = inject(UsersService);
  user = input.required<GetUserDTO>();
  selectedId = output<number>();

  editUser(id: number) {
    this.usersService.navigationOpen.set(false);
    this.selectedId.emit(id);
  }
}