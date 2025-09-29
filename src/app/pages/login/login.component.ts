import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { tap } from 'rxjs';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';
import { WarehouseService } from '../../services/warehouse.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: []
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private warehouseService = inject(WarehouseService);
  private destroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);
  private router = inject(Router);
  isLoading = signal<boolean>(false);
  form!: FormGroup;

  ngOnInit() {
    this.warehouseService.leaveRoom();
    localStorage.removeItem('notifications');
    this.alertService.notifications.set([]);
    this.initForm();
  }

  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }

  onSubmit() {
    this.isLoading.set(true);
    const data = { email: this.form.value.email, password: this.form.value.password };
    this.disableInputs()
    const subscription = this.authService.login(data).pipe(
      tap(response => {
        if (response === null) {
          this.isLoading.set(false);
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
        } else if (response.isSuccess === false) {
          this.isLoading.set(false);
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else {
          localStorage.setItem('token', response.result);
          this.authService.setUserDetail(response.result);
          this.isLoading.set(false);
          this.router.navigate(['main']);
          this.warehouseService.userName.set(this.authService.user().name);
          this.warehouseService.userRole.set(this.authService.user().role);
          this.warehouseService.userDestination.set(this.authService.user().destination);
          this.warehouseService.token.set(this.authService.getToken()!);
          localStorage.setItem('userRole', this.authService.user().role);
          localStorage.setItem('userName', this.authService.user().name);
          localStorage.setItem('userDestination', this.authService.user().destination);
        }
      })
    ).subscribe({
      next: () => {
        this.enableInputs();
      },
      error: () => {
        this.isLoading.set(false);
        this.enableInputs();
      }
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  private disableInputs() {
    this.password?.disable();
    this.email?.disable();
  }

  private enableInputs() {
    this.password?.enable();
    this.email?.enable();
  }

  private initForm() {
    this.form = new FormGroup({
      'email': new FormControl('', [Validators.required, Validators.email]),
      'password': new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }
}
