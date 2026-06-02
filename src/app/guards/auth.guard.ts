import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../stores/auth-store/auth.store';
import { mustSelectDestination } from '../stores/auth-store/auth.helpers';

export const AuthGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const mustSelect = mustSelectDestination(
    auth.user(),
    auth.destinationSelected(),
  );

  if (state.url === '/select-destination') {
    return mustSelect ? true : router.createUrlTree(['/main']);
  }

  if (mustSelect) {
    return router.createUrlTree(['/select-destination']);
  }

  return true;
};
