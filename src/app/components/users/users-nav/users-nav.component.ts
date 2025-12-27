import { Component, inject } from '@angular/core';
import { UsersStore } from '../../../stores/user-store/users.store';
import { INITIAL_USER } from '../../../models/users/user.interface';

@Component({
  selector: 'app-users-nav',
  imports: [],
  templateUrl: './users-nav.component.html',
  styleUrl: './users-nav.component.scss'
})
export class UsersNavComponent {
  readonly store = inject(UsersStore);

  createUser() {
    this.store.selectUser(INITIAL_USER);
  }
}