import { Component, computed, inject, model } from '@angular/core';
import { UsersService } from '../../../services/users.service';
import { UsersComponent } from '../../../pages/users/users.component';

@Component({
  selector: 'app-users-nav',
  imports: [],
  templateUrl: './users-nav.component.html',
  styleUrl: './users-nav.component.scss'
})
export class UsersNavComponent {
  private usersService = inject(UsersService);
  usersComp = inject(UsersComponent);
  isOpened = computed(() => this.usersService.navigationOpen());
  edit = model(false);
  filter = model<'All' | 'F-M' | 'OVA'>('All');
  role = model<'User' | 'Master' | 'Admin'>('User');
  selectedList = model(6);

  onOpen() {
    if (this.edit()) {
      this.edit.set(false);
      this.usersService.navigationOpen.set(true);
    } else {
      return;
    }
  }

  createUpdate() {
    this.usersService.navigationOpen.set(false);
    if (this.edit()) {
      this.usersService.resetUser();
    } else {
      this.usersService.clearUser();
    }
    this.edit.set(!this.edit());
  }
}