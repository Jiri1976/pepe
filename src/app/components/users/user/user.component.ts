import { ChangeDetectorRef, Component, computed, DestroyRef, effect, inject, output, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule, AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '../../../services/alert.service';
import { ConvertToGetUserDTO, ConvertToUserDTO } from '../../../helpers/conversions';
import { GetUserDTO } from '../../../models/users/getUserDTO.interface';
import { SpinnerComponent } from "../../spinner/spinner.component";
import { ErrorHandlingService } from '../../../services/error-handling.service';
import { ConfirmService } from '../../../services/confirm.service';
import { concatMap, of } from 'rxjs';
import { NotificationComponent } from "../../notification/notification.component";
import { UsersService } from '../../../services/users.service';
import { CommonModule } from '@angular/common';
import { CheckBoxesValidator } from '../../../helpers/user-checkboxes.validation';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SpinnerComponent, NotificationComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {
  private destroyRef = inject(DestroyRef);
  private usersService = inject(UsersService);
  private alertService = inject(AlertService);
  private errorHandlingService = inject(ErrorHandlingService);
  private confirmService = inject(ConfirmService);
  private cdr = inject(ChangeDetectorRef);
  back = output<boolean>();
  user = computed(() => this.usersService.user());
  nothingChanged = true;
  deletedUser = output<number>();
  createdUser = output<GetUserDTO>();
  updatedUser = output<GetUserDTO>();
  isLoading = false;
  userForm!: FormGroup;
  inputsFocused = signal(false);
  activeUser = signal(true);

  userIsChanged = effect(() => {
    if (this.user().id > 0) {
      this.patchForm();
      this.nothingChanged = true;
    } else {
      this.initializedUserForm();
      this.nothingChanged = true;
    }
  });

  get name() {
    return this.userForm.get('name');
  }

  get surname() {
    return this.userForm.get('surname');
  }

  get email() {
    return this.userForm.get('email');
  }

  get password() {
    return this.userForm.get('password');
  }

  get role() {
    return this.userForm.get('role');
  }

  get position() {
    return this.userForm.get('position');
  }

  get destination() {
    return this.userForm.get('destination');
  }

  get isActive() {
    return this.userForm.get('isActive');
  }

  onGoBack() {
    this.back.emit(true);
    this.initializedUserForm();
  }

  onSubmit() {
    if (this.userForm.invalid) {
      return;
    }

    if (this.user().id === 0) {
      let _user = this.userForm.value;
      _user.id = this.user().id;
      _user.nick = _user.name!.substring(0, 1) + _user.surname!.substring(0, 1);
      this.confirmService.confirm('Opravdu chceš přidat uživatele?')
        .then((confirmed) => {
          if (confirmed) {
            this.isLoading = true;
            const userDTO = ConvertToUserDTO(_user);

            const subscription = this.usersService.createUser(userDTO).pipe(
              concatMap(response => {
                this.isLoading = false;
                if (response === null) {
                  this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
                } else if (response.isSuccess === false) {
                  this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
                } else if (response.isSuccess) {
                  userDTO.id = response.result;
                  userDTO.password = '';
                  const getUserDTO = ConvertToGetUserDTO(userDTO);
                  this.usersService.setUser(getUserDTO);
                  this.usersService.addUser(getUserDTO);
                  this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: `Úspěšně přidán - ${userDTO.name} ${userDTO.surname}` });
                  this.createdUser.emit(getUserDTO);
                }
                return of();
              }),
            ).subscribe({
              next: () => {

              },
              error: error => this.handleError(error)
            });

            this.destroyRef.onDestroy(() => {
              subscription.unsubscribe();
            });
          }
        });
    } else {
      let _user = this.userForm.value;
      _user.id = this.user().id;
      _user.nick = _user.name!.substring(0, 1) + _user.surname!.substring(0, 1);
      if (this.user().role === 'Admin' || this.user().role === 'Master') {
        _user.role = this.user().role;
        _user.destination = this.user().destination;
        _user.position = this.user().position;
      }

      this.confirmService.confirm('Opravdu chceš upravit uživatele?')
        .then((confirmed) => {
          if (confirmed) {
            this.isLoading = true;
            const getUserDTO = ConvertToGetUserDTO(_user);
            const subscription = this.usersService.updateUser(getUserDTO).pipe(
              concatMap(response => {
                this.isLoading = false;
                if (response === null) {
                  this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
                } else if (response.isSuccess === false) {
                  this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
                } else if (response.isSuccess) {
                  this.usersService.setUser(getUserDTO);
                  this.updatedUser.emit(getUserDTO);
                  this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: response.result });
                  this.usersService.updateAllAfterUpdate(getUserDTO);
                }
                return of();
              }),
            ).subscribe({
              next: () => {

              },
              error: error => this.handleError(error)
            });

            this.destroyRef.onDestroy(() => {
              subscription.unsubscribe();
            });
          }
        });
    }
  }

  onDelete() {
    this.confirmService.confirm('Opravdu chceš smazat uživatele?')
      .then((confirmed) => {
        if (confirmed) {
          this.isLoading = true;
          const subscription = this.usersService.deleteUser(this.user().id).pipe(
            concatMap(response => {
              let userId = this.user().id;
              this.isLoading = false;
              if (response === null) {
                this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
              } else if (response.isSuccess === false) {
                this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
              } else if (response.isSuccess) {
                this.deletedUser.emit(this.user().id);
                this.usersService.removeUser(userId);
                this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: `Uživatel byl úspěšně smazán.` });
                this.onGoBack();
              }
              return of();
            }),
          ).subscribe({
            next: () => {

            },
            error: error => this.handleError(error)
          });

          this.destroyRef.onDestroy(() => {
            subscription.unsubscribe();
          });
        }
      });
  }

  checkValues() {
    let name = true;
    let surname = true;
    let email = true;
    let role = true;
    let position = true;
    let destination = true;
    let isActive = true;
    if (this.user().name !== this.userForm.value.name) {
      name = false;
    } else { }
    if (this.user().surname !== this.userForm.value.surname) {
      surname = false;
    }
    if (this.user().email !== this.userForm.value.email) {
      email = false;
    }
    if (this.user().role === 'User') {
      if (this.user().role !== this.userForm.value.role) {
        role = false;
      }
      if (this.user().position !== this.userForm.value.position) {
        position = false;
      }
      if (this.user().destination !== this.userForm.value.destination) {
        destination = false;
      }
      if (this.user().isActive !== this.userForm.value.isActive) {
        isActive = false;
      }
    }
    this.nothingChanged = name && surname && email && role && position && destination && isActive;
  }

  notificate() {
    let nameIsFalse = (this.name?.touched && this.name?.hasError('required') || this.name?.untouched && this.name?.dirty && this.name?.hasError('required') || this.name?.hasError('maxlength'));
    let surnameIFalse = (this.surname?.touched && this.surname?.hasError('required') || this.surname?.untouched && this.surname?.dirty && this.surname?.hasError('required') || this.surname?.hasError('maxlength'));
    let emailIsFalse = (this.email?.touched && this.email?.hasError('required') || (this.email?.touched && this.email?.hasError('email')));
    let passwordIsFalse = (this.password?.touched && this.password?.hasError('required') || this.password?.untouched && this.password?.dirty && this.password?.hasError('required') || this.password?.hasError('maxlength'));
    let checkBoxesAreFalse = this.userForm.hasError('checkBoxesInvalid');

    return nameIsFalse ||
      surnameIFalse ||
      emailIsFalse ||
      passwordIsFalse ||
      (!nameIsFalse && !surnameIFalse && !emailIsFalse && !passwordIsFalse && !this.inputsFocused() && checkBoxesAreFalse);
  }

  showBoxError(control: AbstractControl | null) {
    return this.name?.valid &&
      this.surname?.valid &&
      this.email?.valid &&
      this.password?.valid &&
      !this.inputsFocused() &&
      control?.hasError('required');
  }

  nameCanShake() {
    return this.name?.touched &&
      this.name?.hasError('required') ||
      this.name?.untouched &&
      this.name?.dirty &&
      this.name?.hasError('required') ||
      this.name?.hasError('maxlength');
  }

  surnameCanShake() {
    return this.surname?.touched &&
      this.surname?.hasError('required') ||
      this.surname?.untouched &&
      this.surname?.dirty &&
      this.surname?.hasError('required') ||
      this.surname?.hasError('maxlength');
  }

  emailCanShake() {
    return this.email?.touched &&
      this.email?.hasError('required') ||
      (this.email?.touched &&
        this.email?.hasError('email'));
  }

  passwordCanShake() {
    return this.password?.touched &&
      this.password?.hasError('required') ||
      this.password?.untouched &&
      this.password?.dirty &&
      this.password?.hasError('required') ||
      this.password?.hasError('maxlength');
  }

  onInputFocus() {
    this.inputsFocused.set(true);
  }

  onInputBlur() {
    this.inputsFocused.set(false);
  }

  changeIsActive() {
    this.activeUser.set(!this.activeUser());
    this.userForm.get('isActive')?.setValue(this.activeUser());
    this.checkValues();
    // this.cdr.detectChanges();
  }

  private initializedUserForm() {
    this.userForm = new FormGroup({
      'id': new FormControl({
        value: this.user().id,
        disabled: true
      }),
      'name': new FormControl({
        value: this.user().name,
        disabled: false
      }, [
        Validators.required,
        Validators.maxLength(15)
      ]
      ),
      'surname': new FormControl({
        value: this.user().surname,
        disabled: false
      }, [Validators.required,
      Validators.maxLength(20)]),
      'email': new FormControl({
        value: this.user().email,
        disabled: false
      }, [Validators.required,
      Validators.email]),
      'password': new FormControl({
        value: this.user().password === undefined || this.user().password === null ? '' : this.user().password,
        disabled: this.user().id > 0
      }, [Validators.required, Validators.maxLength(14)]),
      'role': new FormControl({
        value: this.user().role,
        disabled: false
      }, [Validators.required]),
      'position': new FormControl({
        value: this.user().position,
        disabled: false
      }, [Validators.required]),
      'destination': new FormControl({
        value: this.user().destination,
        disabled: false
      }, [Validators.required]),
      'nick': new FormControl({
        value: this.user().nick,
        disabled: true
      }, []),
      'isActive': new FormControl({
        value: true,
        disabled: false
      }, [])
    }, { validators: CheckBoxesValidator.CheckBoxesAreCheckedValidator });
  }

  private patchForm() {
    this.userForm.patchValue({
      id: this.user().id,
      name: this.user().name,
      surname: this.user().surname,
      email: this.user().email,
      password: 'password',
      role: this.user().role,
      position: this.user().position,
      destination: this.user().destination,
      nick: this.user().nick,
      isActive: this.user().isActive
    });

    if (this.user().role !== 'User') {
      this.userForm.get('role')?.disable();
      this.userForm.get('destination')?.disable();
      this.userForm.get('position')?.disable();
    }

    this.activeUser.set(this.user().isActive);
  }

  private handleError = (errorRes: HttpErrorResponse) => {
    this.isLoading = false;
    return this.errorHandlingService.handleError(errorRes);
  };
}