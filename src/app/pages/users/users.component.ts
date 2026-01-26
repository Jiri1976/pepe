import { Component, inject, OnInit } from '@angular/core';
import { UserItemComponent } from '../../components/users/user-item/user-item.component';
import { UserPaginationComponent } from '../../components/users/user-pagination/user-pagination.component';
import { EmptyBlockComponent } from "../../components/users/empty-block/empty-block.component";
import { UsersNavComponent } from '../../components/users/users-nav/users-nav.component';
import { UsersStore } from '../../stores/user-store/users.store';

@Component({
  selector: 'app-users',
  imports: [
    UserItemComponent,
    UserPaginationComponent,
    EmptyBlockComponent,
    UsersNavComponent,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  readonly store = inject(UsersStore);

  ngOnInit() {
    this.store.getUsers();
  }
}