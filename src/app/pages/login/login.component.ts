import { Component, inject, OnInit, signal } from '@angular/core';
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
  readonly store = inject(AuthStore);
  private signalService = inject(SignalService);
  private toaster = inject(ToasterService);
  protected model = signal<LoginForm>({
    email: '',
    password: ''
  });

  protected form = form(this.model, s => {
    required(s.email, { message: 'Email je povinný' });
    email(s.email, { message: 'Neplatná emailová adresa' });
    required(s.password, { message: 'Heslo je povinné' });
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
    this.store.submit(this.form().value());
  }
}