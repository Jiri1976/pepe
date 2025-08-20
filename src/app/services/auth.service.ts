import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Response } from '../models/response.interface';
import { jwtDecode } from 'jwt-decode';
import { AuthUser } from '../models/auth-user.interface';
import { Router } from '@angular/router';
import { WarehouseService } from './warehouse.service';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private BASE_ROUTE = environment.AUTHENTICATION_PATH;
  private router = inject(Router);
  private tokenExpirationTimer: any;
  private initialUser: AuthUser = { name: '', email: '', role: '', destination: '', token: '', expiresIn: '' };
  private warehouseService = inject(WarehouseService);
  private alertService = inject(AlertService);

  user = signal<AuthUser>(this.initialUser);
  firstRun = true;

  login(loginRequest: any) {
    const url = this.BASE_ROUTE + 'authentication/Login';
    return this.http.post<Response>(url, loginRequest, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
    })
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
    localStorage.removeItem('notifications');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userDestination');
    localStorage.removeItem('token');
    this.alertService.notifications.set([]);
    this.warehouseService.items.set([]);
    this.warehouseService.selectedUnit.set({ id: 0, warehouseCardId: 0, warehouseItemId: 0, date: '', amount: 0 });
    this.warehouseService.warehouseCard.set({ id: 0, warehouseItemId: 0, warehouseItemName: '', monthYear: '', monthYearName: '', destination: '', units: [] });
    this.warehouseService.leaveRoom();
    this.user.set(this.initialUser);
    this.firstRun = true;
    this.router.navigate(['login']);
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
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

  getUser(): AuthUser {
    const user = { ...this.user() };
    return user;
  }

  setUserDetail(token: string) {
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
}