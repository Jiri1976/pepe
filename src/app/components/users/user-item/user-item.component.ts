import { Component, inject, input } from '@angular/core';
import { User } from '../../../models/users/user.interface';
import { UsersStore } from '../../../stores/user-store/users.store';

@Component({
  selector: 'app-user-item',
  imports: [],
  templateUrl: './user-item.component.html',
  styleUrl: './user-item.component.scss'
})
export class UserItemComponent {
  readonly store = inject(UsersStore);
  user = input.required<User>();

  editUser() {
    this.store.selectUser(this.user());
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