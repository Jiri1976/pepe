import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { UserItemComponent } from '../../components/users/user-item/user-item.component';
import { UserPaginationComponent } from '../../components/users/user-pagination/user-pagination.component';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { UsersService } from '../../services/users.service';
import { tap } from 'rxjs';
import { EmptyBlockComponent } from "../../components/users/empty-block/empty-block.component";
import { UsersNavComponent } from '../../components/users/users-nav/users-nav.component';
import { ToasterService } from '../../services/toaster.service';

@Component({
  selector: 'app-users',
  imports: [
    UserItemComponent,
    UserPaginationComponent,
    ConfirmComponent,
    EmptyBlockComponent,
    UsersNavComponent,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  private usersService = inject(UsersService);
  private toaster = inject(ToasterService);
  private destroyRef = inject(DestroyRef);
  isLoading = signal(false);
  filteredUsers = computed(() => this.usersService.filteredUsers());

  ngOnInit() {
    this.getUsers();
  }

  getUsers() {
    this.usersService.filter.set('All');
    this.usersService.role.set('User');
    this
    this.isLoading.set(true);
    const subscription = this.usersService.getUsers(true).pipe(
      tap(response => {
        this.isLoading.set(false);
        if (response === null) {
          this.toaster.error('Něco se pokazilo, zkus to znovu.');
        } else if (response.isSuccess === false) {
          this.toaster.error(response.errorMessage);
        } else {
          this.usersService.setUsers(response.result);
          this.usersService.filteredUsers.set(this.usersService.filterUsers(response.result));
        }
      }),
      tap({
        error: () => this.isLoading.set(false)
      })
    ).subscribe();
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  getEmptyLines() {
    let fakeArray = [];
    for (let i = 0; i < 10 - this.filteredUsers().length; i++) {
      fakeArray.push(i);
    }
    return fakeArray;
  }
}