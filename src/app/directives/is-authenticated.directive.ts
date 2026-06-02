import { Directive, effect, HostBinding, inject } from '@angular/core';
import { AuthStore } from '../stores/auth-store/auth.store';
import { hasMoreThanOneDestination } from '../stores/auth-store/auth.helpers';

@Directive({
  selector: '[appIsAuthenticated]',
})
export class IsAuthenticated {
  readonly store = inject(AuthStore);
  @HostBinding('style.display') display: string | null = null;

  constructor() {
    effect(() => {
      const user = this.store.user();

      const mustSelectDestination =
        !!user &&
        user.role === 'Master' &&
        hasMoreThanOneDestination(user.token) &&
        this.store.destinationSelected() === false;

      this.display = user && !mustSelectDestination ? null : 'none';
    });
  }
}
