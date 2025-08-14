import { Component, inject, input } from '@angular/core';
import { PageAnimation } from '../../../animations/page.animation';
import { UsersService } from '../../../services/users.service';
import { Dialog } from '@angular/cdk/dialog';
import { UserComponent } from '../user/user.component';
import { User } from '../../../models/users/user.interface';

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
  user = input.required<User>();

  editUser() {
    this.usersService.setUser(this.user());
    this.dialog.open(UserComponent, { disableClose: false });
  }

  hasPosition(position: 'Driver' | 'Cook'): boolean {
    if (this.user().role !== 'User') {
      return false;
    }
    return this.user().destinations?.some(dest =>
      dest.positions?.some(pos => pos.position === position)
    ) ?? false;
  }
}