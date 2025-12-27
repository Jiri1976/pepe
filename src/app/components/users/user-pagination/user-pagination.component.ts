import { Component, inject } from '@angular/core';
import { UsersStore } from '../../../stores/user-store/users.store';

@Component({
  selector: 'app-user-pagination',
  imports: [],
  templateUrl: './user-pagination.component.html',
  styleUrl: './user-pagination.component.scss'
})
export class UserPaginationComponent {
  readonly store = inject(UsersStore);
}