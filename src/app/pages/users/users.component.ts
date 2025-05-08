import { ChangeDetectorRef, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { UserComponent } from '../../components/users/user/user.component';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { UserItemComponent } from '../../components/users/user-item/user-item.component';
import { GetUserDTO } from '../../models/users/getUserDTO.interface';
import { UserPaginationComponent } from '../../components/users/user-pagination/user-pagination.component';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { NavButtonStaticComponent } from "../../components/ui-buttons/nav-button-static/nav-button-static.component";
import { NavButtonActiveComponent } from "../../components/ui-buttons/nav-button-active/nav-button-active.component";
import { UsersService } from '../../services/users.service';
import { tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlingService } from '../../services/error-handling.service';
import { AlertService } from '../../services/alert.service';
import { CommonModule } from '@angular/common';
import { EmptyBlockComponent } from "../../components/users/empty-block/empty-block.component";

@Component({
  selector: 'app-users',
  imports: [
    CommonModule,
    UserComponent,
    SpinnerComponent,
    UserItemComponent,
    UserPaginationComponent,
    ConfirmComponent,
    NavButtonStaticComponent,
    NavButtonActiveComponent,
    EmptyBlockComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  private usersService = inject(UsersService);
  private perPage = 10;
  private errorHandlingService = inject(ErrorHandlingService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  private PER_PAGE = 10;
  private cdr = inject(ChangeDetectorRef);
  flipped = signal(false);
  isLoading = false;
  users = computed(() => this.usersService.users());
  filter = signal<'All' | 'F-M' | 'OVA'>('All');
  role = signal<'User' | 'Master' | 'Admin'>('User');
  selectedList = 6;
  currentPage = signal<number>(1);
  filteredUsers = signal<GetUserDTO[]>([]);
  hasNextPage = signal<boolean>(false);
  hasPreviousPage = signal<boolean>(false);
  lastPage = signal<number>(1);

  ngOnInit() {
    this.isLoading = true;
    const subscription = this.usersService.getUsers(true).pipe(
      tap(response => {
        this.isLoading = false;
        if (response === null) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
        } else if (response.isSuccess === false) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else {
          let _users = this.sortUsers(response.result)
          this.usersService.setUsers(_users);
          this.filteredUsers.set(this.filterUsers(_users));
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

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  filterUsers(users: GetUserDTO[]) {
    this.hasNextPage.set(this.PER_PAGE * this.currentPage() < users.length);
    this.hasPreviousPage.set(this.currentPage() > 1);
    // this.lastPage.set(Array(Math.ceil(users.length / this.PER_PAGE)));
    this.lastPage.set(Math.ceil(users.length / this.PER_PAGE));
    return users.slice((this.currentPage() - 1) * this.perPage, this.perPage * this.currentPage());
  }

  onCreate(user: GetUserDTO) {
    let _users = this.usersService.storedUsers();
    _users = this.sortUsers(_users);
    this.usersService.setUsers(_users);
    this.filteredUsers.set(this.filterUsers(_users));
    this.onSelectList(this.selectedList);
  }

  onSelectList(value: number, pageNumber?: number) {
    this.selectedList = value;
    if (!pageNumber) {
      this.currentPage.set(1);
    } else {
      this.currentPage.set(pageNumber);
    }
    if (value === 1) {
      this.filter.set('F-M');
      let _users = this.users().filter(i => this.role() === 'Admin' ? i.role === this.role() : i.destination === this.filter() && i.role === this.role());
      this.filteredUsers.set(this.filterUsers(_users));
    } else if (value === 2) {
      this.filter.set('OVA');
      let _users = this.users().filter(i => this.role() === 'Admin' ? i.role === this.role() : i.destination === this.filter() && i.role === this.role());
      this.filteredUsers.set(this.filterUsers(_users));
    } else if (value === 3) {
      this.role.set('User');
      let _users = this.users().filter(i => this.filter() === 'All' ? i.role === this.role() : i.destination === this.filter() && i.role === this.role());
      this.filteredUsers.set(this.filterUsers(_users));
    } else if (value === 4) {
      this.role.set('Master');
      let _users = this.users().filter(i => this.filter() === 'All' ? i.role === this.role() : i.destination === this.filter() && i.role === this.role());
      this.filteredUsers.set(this.filterUsers(_users));
    } else if (value === 5) {
      this.role.set('Admin');
      let _users = this.users().filter(i => i.role === this.role());
      this.filteredUsers.set(this.filterUsers(_users));
    } else if (value === 6) {
      this.filter.set('All');
      let _users = [...this.users()];
      this.filteredUsers.set(this.filterUsers(_users));
    }
  }

  open() {
    if (this.flipped()) {
      this.usersService.resetUser();
    } else {
      this.usersService.clearUser();
    }
    this.flipped.set(!this.flipped());
  }

  close() {
    this.usersService.clearUser();
    this.flipped.set(false);
  }

  goBack() {
    this.usersService.clearUser();
    this.close();
  }

  editUser(id: number) {
    this.usersService.setUser(this.users().find(u => u.id === id)!);
    this.flipped.set(true);
  }

  onSelectPage(selectedPage: number) {
    this.currentPage.set(selectedPage);
    this.onSelectList(this.selectedList, this.currentPage());
  }

  onRemoveUser(id: number) {
    let _users = [...this.users()];
    _users = _users.filter((user) => user.id !== id);
    this.usersService.setUsers(_users);
    this.onSelectList(this.selectedList);
    this.usersService.clearUser();
  }

  onUpdateUser(_user: GetUserDTO) {
    let _users = [...this.users()];
    _users = _users.map(user => {
      if (user.id === _user.id) {
        return { ...user, name: _user.name, surname: _user.surname, email: _user.email, role: _user.role, destination: _user.destination, position: _user.position, isActive: _user.isActive };
      } else {
        return user;
      }
    });
    _users = this.sortUsers(_users);
    this.usersService.setUsers(_users);
    this.filteredUsers.set(this.filterUsers(_users));
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
    this.isLoading = false;
    return this.errorHandlingService.handleError(errorRes);
  };
}