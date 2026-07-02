import { Component, inject, signal } from '@angular/core';
import { AuthStore } from '../../stores/auth-store/auth.store';
import { form, email, required, FormField } from '@angular/forms/signals';
import { FieldWrapperComponent } from '../../components/filed-wrapper/field-wrapper.component';

interface LoginForm {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [FormField, FieldWrapperComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export default class LoginComponent {
  readonly store = inject(AuthStore);
  protected model = signal<LoginForm>({
    email: '',
    password: '',
  });

  protected form = form(this.model, (s) => {
    required(s.email, { message: 'Email je povinný' });
    email(s.email, { message: 'Neplatná emailová adresa' });
    required(s.password, { message: 'Heslo je povinné' });
  });

  onSubmit() {
    if (this.form().invalid()) {
      return;
    }
    this.store.submit(this.form().value());
  }
}
