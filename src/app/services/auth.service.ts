import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Response } from '../models/response.interface';
import { AlertService } from './alert.service';
import { jwtDecode } from 'jwt-decode';
import { AuthUser } from '../models/auth-user.interface';
import { Router } from '@angular/router';
import { WarehouseService } from './warehouse.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private destroyRef = inject(DestroyRef);
  private http = inject(HttpClient);
  private BASE_ROUTE = environment.AUTHENTICATION_PATH;
  private alertService = inject(AlertService);
  private router = inject(Router);
  private tokenExpirationTimer: any;
  private initialUser: AuthUser = { name: '', email: '', role: '', destination: '', token: '', expiresIn: '' };
  private warehouseService = inject(WarehouseService);
  isLoading = signal<boolean>(false);
  user = signal<AuthUser>(this.initialUser);
  firstRun = true;

  constructor() { }

  login(loginRequest: any) {
    this.isLoading.set(true);
    const url = this.BASE_ROUTE + 'authentication/Login';
    const subscription = this.http.post<Response>(url, loginRequest, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
    }).subscribe({
      next: response => {
        if (response.isSuccess === false) {
          this.isLoading.set(false);
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else {
          localStorage.setItem('token', response.result);
          this.setUserDetail(response.result);
          this.router.navigate(['main']);
          setTimeout(() => {
            this.isLoading.set(false);
          }, 500);
        }
      },
      error: error => this.handleError(error)
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  isLoggedIn = (): boolean => {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    return this.isTokenExpired();
  }

  getToken = (): string | null => {
    const token = localStorage.getItem('token');
    if (!token) {
      this.user.set(this.initialUser);
      return null;
    }
    return token;
  };

  logout() {
    this.warehouseService.items.set([]);
    this.warehouseService.selectedUnit.set({ id: 0, warehouseCardId: 0, warehouseItemId: 0, date: '', amount: 0 });
    this.warehouseService.warehouseCard.set({ id: 0, warehouseItemId: 0, warehouseItemName: '', monthYear: '', monthYearName: '', destination: '', units: [] });

    localStorage.removeItem('token');
    this.user.set(this.initialUser);
    this.firstRun = true;
    this.router.navigate(['login']);
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      localStorage.removeItem('token');
      this.user.set(this.initialUser);
      this.logout();
    }, expirationDuration);
  }

  autoLogin() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.logout();
    } else {
      this.setUserDetail(token!);
      this.router.navigate(['main']);
    }
  }

  updateUser(data: { name: string, surname: string, email: string }) {
    let _user = { ...this.user() };
    _user.name = data.name + ' ' + data.surname;
    _user.email = data.email;
    this.user.set(_user);
  }

  getUser() {
    const user = { ...this.user() };
    return user;
  }

  getFirtsRun() {
    return this.firstRun;
  }

  disableFirstRun() {
    this.firstRun = false;
  }

  private setUserDetail(token: string) {
    const decodedToken: any = jwtDecode(token!);
    let date = new Date(decodedToken.exp * 1000);
    const expirationTime = date.getTime() - new Date().getTime();
    if (expirationTime <= 0) {
      this.logout();
      return;
    }
    this.autoLogout(expirationTime);
    this.user.set({
      name: decodedToken.name,
      email: decodedToken.email,
      role: decodedToken.role,
      destination: decodedToken.destination,
      token: token!,
      expiresIn: date.toString()
    });
  }

  private isTokenExpired() {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    const decodedToken: any = jwtDecode(token!);
    let date = new Date(decodedToken.exp * 1000);
    const isTokenExpired = date.getTime() - new Date().getTime() > 0;
    return isTokenExpired;
  }

  private handleError = (errorRes: HttpErrorResponse) => {
    this.isLoading.set(false);
    let errorMessage = 'Vyskytla se chyba!';
    if (!errorRes.error || !errorRes.error.message) {
      this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: errorMessage });
      return throwError(() => errorMessage);
    }
    this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: errorRes.error.message });
    return throwError(() => errorRes.error.message);
  }
}