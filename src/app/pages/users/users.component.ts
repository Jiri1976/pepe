import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { UserItemComponent } from '../../components/users/user-item/user-item.component';
import { EmptyBlockComponent } from "../../components/users/empty-block/empty-block.component";
import { UsersStore } from '../../stores/user-store/users.store';
import { NavigationComponent } from "../../components/navigation/navigation.component";
import { NavButtonComponent } from "../../components/navigation/nav-button.component";
import { INITIAL_USER } from '../../models/users.interface';
import { PagingComponent } from "../../components/paging/paging.component";
import { PrevNextButtonComponent } from '../../components/paging/prev-next-button.component';
import { PagingNavButtonComponent } from '../../components/paging/paging-nav-button.component';
import { DestinationButtonComponent } from "../../components/paging/destination-button.component";

@Component({
  selector: 'app-users',
  imports: [
    UserItemComponent,
    EmptyBlockComponent,
    NavigationComponent,
    NavButtonComponent,
    PagingComponent,
    PrevNextButtonComponent,
    PagingNavButtonComponent,
    DestinationButtonComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  readonly store = inject(UsersStore);
  width = signal(window.innerWidth);

  @HostListener('window:resize')
  onWindowResize() {
    this.width.set(window.innerWidth);
  }

  ngOnInit() {
    this.store.getUsers();
  }

  createUser() {
    this.store.selectUser(INITIAL_USER);
  }
}