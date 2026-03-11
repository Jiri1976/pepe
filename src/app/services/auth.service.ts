import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Response } from '../models/response.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private BASE_ROUTE = environment.AUTHENTICATION_PATH;

  login(loginRequest: { email: string, password: string }) {
    const url = this.BASE_ROUTE + 'Login';
    return this.http.post<Response>(url, loginRequest);
  }
}