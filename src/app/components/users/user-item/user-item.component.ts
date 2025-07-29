import { Component, inject, input } from '@angular/core';
import { GetUserDTO } from '../../../models/users/getUserDTO.interface';
import { PageAnimation } from '../../../animations/page.animation';
import { UsersService } from '../../../services/users.service';
import { Dialog } from '@angular/cdk/dialog';
import { UserComponent } from '../user/user.component';

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
  private usersService = inject(UsersService);
  private dialog = inject(Dialog)
  user = input.required<GetUserDTO>();

  editUser() {
    this.usersService.setUser(this.user());
    this.dialog.open(UserComponent, { disableClose: false });
  }
}