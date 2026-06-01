import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../stores/auth-store/auth.store';
import { Dialog } from '@angular/cdk/dialog';
import { hasMoreThanOneDestination } from '../stores/auth-store/auth.helpers';
import { SelectDestinationComponent } from '../components/select-destination/select-destination.component';

export const AuthGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  const dialog = inject(Dialog);

  if (auth.isLoggedIn()) {
    if (
      hasMoreThanOneDestination(auth.user()!.token) &&
      auth.user()!.role === 'Master' &&
      auth.destinationSelected() === false
    ) {
      dialog.open(SelectDestinationComponent, { disableClose: true });
      return false;
    }

    return true;
  }

  router.navigate(['/login']);
  return false;
};
