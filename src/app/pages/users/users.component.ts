import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { UserItemComponent } from '../../components/users/user-item/user-item.component';
import { GetUserDTO } from '../../models/users/getUserDTO.interface';
import { UserPaginationComponent } from '../../components/users/user-pagination/user-pagination.component';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { UsersService } from '../../services/users.service';
import { tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlingService } from '../../services/error-handling.service';
import { AlertService } from '../../services/alert.service';
import { EmptyBlockComponent } from "../../components/users/empty-block/empty-block.component";
import { UsersNavComponent } from '../../components/users/users-nav/users-nav.component';
import { PageAnimation } from '../../animations/page.animation';

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
  styleUrl: './users.component.scss',
  animations: [
    PageAnimation
  ]
})
export class UsersComponent implements OnInit {
  private usersService = inject(UsersService);
  private errorHandlingService = inject(ErrorHandlingService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  isLoading = signal(false);
  users = computed(() => this.usersService.users());
  filteredUsers = computed(() => this.usersService.filteredUsers());

  ngOnInit() {
    this.usersService.filter.set('All');
    this.usersService.role.set('User');
    this
    this.isLoading.set(true);
    const subscription = this.usersService.getUsers(true).pipe(
      tap(response => {
        this.isLoading.set(false);
        if (response === null) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
        } else if (response.isSuccess === false) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else {
          let _users = this.sortUsers(response.result)
          this.usersService.setUsers(_users);
          this.usersService.filteredUsers.set(this.usersService.filterUsers(_users))
        }
      }),
      tap({
        error: error => this.handleError(error)
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

  private sortUsers(users: GetUserDTO[]) {
    return users.sort((a, b) => {
      const surnameComparison = a.surname.localeCompare(b.surname);
      if (surnameComparison !== 0) {
        return surnameComparison;
      }
      return a.name.localeCompare(b.name);
    });
  }

  private handleError = (errorRes: HttpErrorResponse) => {
    this.isLoading.set(false);
    return this.errorHandlingService.handleError(errorRes);
  };
}