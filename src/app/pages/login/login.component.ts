import { Component, computed, inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SpinnerComponent } from '../../components/spinner/spinner.component';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, SpinnerComponent],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    providers: []
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  isLoading = computed(() => this.authService.isLoading());
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
    const data = { email: this.form.value.email, password: this.form.value.password };
    this.authService.login(data);
  }

  private initForm() {
    this.form = new FormGroup({
      'email': new FormControl('', [Validators.required, Validators.email]),
      'password': new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }
}
