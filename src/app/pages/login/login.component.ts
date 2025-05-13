import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { tap } from 'rxjs';
import { AlertService } from '../../services/alert.service';
import { ErrorHandlingService } from '../../services/error-handling.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: []
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);
  private errorHandlingService = inject(ErrorHandlingService);
  private router = inject(Router);
  isLoading = signal<boolean>(false);
  form!: FormGroup;

  ngOnInit() {
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
        }
      })
    ).subscribe({
      next: () => {
        this.enableInputs();
      },
      error: error => this.handleError(error)
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

  private handleError = (errorRes: HttpErrorResponse) => {
    this.isLoading.set(false);
    return this.errorHandlingService.handleError(errorRes);
  };
}
