import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { tap } from 'rxjs';
import { Router } from '@angular/router';
import { ToasterService } from '../../services/toaster.service';
import { SignalService } from '../../services/signal.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export default class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private signalService = inject(SignalService);
  private destroyRef = inject(DestroyRef);
  private toaster = inject(ToasterService);
  private router = inject(Router);
  isLoading = signal<boolean>(false);
  form!: FormGroup;

  ngOnInit() {
    this.signalService.leaveRoom();
    localStorage.removeItem('notifications');
    this.toaster.notifications.set([]);
    this.initForm();
  }

  onSubmit() {
    this.isLoading.set(true);
    const data = { email: this.form.value.email, password: this.form.value.password };
    this.disableInputs()
    const subscription = this.authService.login(data).pipe(
      tap(response => {
        if (response === null) {
          this.isLoading.set(false);
          this.toaster.error('Něco se pokazilo, zkus to znovu.');
        } else if (response.isSuccess === false) {
          this.isLoading.set(false);
          this.toaster.error(response.errorMessage);
        } else {
          localStorage.setItem('token', response.result);
          this.authService.setUserDetail(response.result);
          this.isLoading.set(false);
          this.router.navigate(['main']);
          this.signalService.userName.set(this.authService.user().name);
          this.signalService.userRole.set(this.authService.user().role);
          this.signalService.userDestination.set(this.authService.user().destination);
          this.signalService.token.set(this.authService.getToken()!);
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
    this.form.disable();
  }

  private enableInputs() {
    this.form.enable();
  }

  private initForm() {
    this.form = new FormGroup({
      'email': new FormControl('', [Validators.required, Validators.email]),
      'password': new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }
}
