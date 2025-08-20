import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { PageAnimation } from '../../../animations/page.animation';
import { UsersService } from '../../../services/users.service';
import { Dialog } from '@angular/cdk/dialog';
import { UserComponent } from '../user/user.component';
import { User } from '../../../models/users/user.interface';
import { map } from 'rxjs';
import { AlertService } from '../../../services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlingService } from '../../../services/error-handling.service';

@Component({
  selector: 'app-user-item',
  imports: [],
  templateUrl: './user-item.component.html',
  styleUrl: './user-item.component.scss',
  animations: [
    PageAnimation
  ]
})
export class UserItemComponent {
  private usersService = inject(UsersService);
  private alertService = inject(AlertService);
  private dialog = inject(Dialog);
  private destroyRef = inject(DestroyRef);
  private errorHandlingService = inject(ErrorHandlingService);
  user = input.required<User>();
  isLoading = signal(false);

  editUser() {
    this.uploadUser();
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
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
        } else if (response.isSuccess === false) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else if (response.isSuccess) {
          this.usersService.setUser(response.result);
          this.dialog.open(UserComponent, { disableClose: false });
        }
      }),
    ).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: error => this.handleError(error)
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  private handleError = (errorRes: HttpErrorResponse) => {
    this.isLoading.set(false);
    return this.errorHandlingService.handleError(errorRes);
  };
}