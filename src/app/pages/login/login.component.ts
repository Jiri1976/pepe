import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { tap } from 'rxjs';
import { ToasterService } from '../../services/toaster.service';
import { SignalService } from '../../services/signal.service';
import { AuthStore } from '../../stores/auth-store/auth.store';
import { form, Field, required, email } from '@angular/forms/signals';

interface LoginForm {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [Field],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export default class LoginComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  private authService = inject(AuthService);
  private signalService = inject(SignalService);
  private destroyRef = inject(DestroyRef);
  private toaster = inject(ToasterService);
  protected model = signal<LoginForm>({
    email: '',
    password: ''
  });

  protected form = form(this.model, s => {
    required(s.email, { message: 'Email je povinný' });
    email(s.email, { message: 'Neplatná emailová adresa' });
    required(s.password, { message: 'Heslo je povinné' });
    //minLength(s.password);
  });

  ngOnInit() {
    this.signalService.leaveRoom();
    localStorage.removeItem('notifications');
    this.toaster.notifications.set([]);
  }

  onSubmit() {
    if (this.form().invalid()) {
      return;
    }
    this.authStore.setIsLoading(true);
    const subscription = this.authService.login(this.form().value()).pipe(
      tap(response => {
        if (response === null) {
          this.authStore.setIsLoading(false);
          this.toaster.error('Něco se pokazilo, zkus to znovu.');
        } else if (response.isSuccess === false) {
          this.authStore.setIsLoading(false);
          this.toaster.error(response.errorMessage);
        } else {
          this.authStore.login(response.result);
        }
      })
    ).subscribe({
      next: () => { },
      error: () => {
        this.authStore.setIsLoading(false);
      }
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}