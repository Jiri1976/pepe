import { Component, inject, OnInit } from '@angular/core';
import { UserItemComponent } from '../../components/users/user-item/user-item.component';
import { UserPaginationComponent } from '../../components/users/user-pagination/user-pagination.component';
import { EmptyBlockComponent } from "../../components/users/empty-block/empty-block.component";
import { UsersStore } from '../../stores/user-store/users.store';
import { NavigationComponent } from "../../components/navigation/navigation.component";
import { NavButtonComponent } from "../../components/navigation/nav-button.component";
import { INITIAL_USER } from '../../models/users.interface';

@Component({
  selector: 'app-users',
  imports: [
    UserItemComponent,
    UserPaginationComponent,
    EmptyBlockComponent,
    NavigationComponent,
    NavButtonComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  readonly store = inject(UsersStore);

  ngOnInit() {
    this.store.getUsers();
  }

  createUser() {
    this.store.selectUser(INITIAL_USER);
  }
}