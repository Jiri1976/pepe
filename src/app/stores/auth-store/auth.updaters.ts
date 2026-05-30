import { PartialStateUpdater } from '@ngrx/signals';
import { AuthSlice } from './auth.slice';
import { Dialog } from '@angular/cdk/dialog';
import { Router } from '@angular/router';
import { setUserDetail } from './auth.helpers';

export function onLogout(
  dialog: Dialog,
  router: Router,
): PartialStateUpdater<AuthSlice> {
  return (_) => {
    dialog.closeAll();
    localStorage.removeItem('token');
    router.navigate(['login']);
    return { user: null, isLoading: false, _tokenExpirationTimer: null };
  };
}

export function onLogin(token: string): PartialStateUpdater<AuthSlice> {
  return (_) => {
    localStorage.setItem('token', token);
    const loggedUser = setUserDetail(token);
    return { user: loggedUser };
  };
}
