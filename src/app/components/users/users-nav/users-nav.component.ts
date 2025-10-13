import { Component, computed, inject } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { UserComponent } from '../user/user.component';
import { UsersService } from '../../../services/users.service';
import { UsersComponent } from '../../../pages/users/users.component';

@Component({
  selector: 'app-users-nav',
  imports: [],
  templateUrl: './users-nav.component.html',
  styleUrl: './users-nav.component.scss'
})
export class UsersNavComponent {
  private dialog = inject(Dialog)
  private usersService = inject(UsersService);
  filter = computed(() => this.usersService.filter());
  role = computed(() => this.usersService.role());
  selectedList = computed(() => this.usersService.selectedList());
  usersComponent = inject(UsersComponent);

  createUser() {
    this.dialog.open(UserComponent, { disableClose: false });
  }

  selectList(index: number) {
    if (index === 1 || index === 2) {
      this.usersService.role.set('User');
    }
    this.usersService.selectList(index);
  }
}