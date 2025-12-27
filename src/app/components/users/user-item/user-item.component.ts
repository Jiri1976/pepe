import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { UsersService } from '../../../services/users.service';
import { Dialog } from '@angular/cdk/dialog';
import { UserComponent } from '../user/user.component';
import { User } from '../../../models/users/user.interface';
import { map } from 'rxjs';
import { ToasterService } from '../../../services/toaster.service';
import { UsersStore } from '../../../stores/user-store/users.store';

@Component({
  selector: 'app-user-item',
  imports: [],
  templateUrl: './user-item.component.html',
  styleUrl: './user-item.component.scss'
})
export class UserItemComponent {
  readonly store = inject(UsersStore);
  private usersService = inject(UsersService);
  private toaster = inject(ToasterService);
  private dialog = inject(Dialog);
  private destroyRef = inject(DestroyRef);
  user = input.required<User>();
  isLoading = signal(false);

  editUser() {
    this.store.selectUser(this.user());
    //this.uploadUser();
  }

  hasPosition(position: 'Driver' | 'Cook'): boolean {
    if (this.user().role !== 'User') {
      return false;
    }
    return this.user().destinations?.some(dest =>
      dest.positions?.some(pos => pos.position === position)
    ) ?? false;
  }

  private uploadUser() {
    this.isLoading.set(true);
    const subscription = this.usersService.getUser(this.user().id).pipe(
      map(response => {
        if (response === null) {
          this.toaster.error('Něco se pokazilo, zkus to znovu.');
        } else if (response.isSuccess === false) {
          this.toaster.error(response.errorMessage);
        } else if (response.isSuccess) {
          //this.usersService.setUser(response.result);
          this.dialog.open(UserComponent, { disableClose: false });
        }
      }),
    ).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}