import { Component, computed, DestroyRef, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule, FormArray } from '@angular/forms';
import { ConfirmService } from '../../../services/confirm.service';
import { concatMap, of } from 'rxjs';
import { UsersService } from '../../../services/users.service';
import { DialogRef } from '@angular/cdk/dialog';
import { FieldsetModule } from 'primeng/fieldset';
import { CheckboxModule } from 'primeng/checkbox';
import { UserDestination } from '../../../models/users/userDestination.interface';
import { UserPosition } from '../../../models/users/userPosition.interface';
import { CheckBoxesValidator } from '../../../helpers/user-checkboxes.validation';
import { ToasterService } from '../../../services/toaster.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, FieldsetModule, CheckboxModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private usersService = inject(UsersService);
  private toaster = inject(ToasterService);
  private confirmService = inject(ConfirmService);
  private dialogRef = inject(DialogRef, { optional: true });
  user = computed(() => this.usersService.user());
  isLoading = signal(false);
  userForm!: FormGroup;
  actionText = signal('');
  inputField = viewChild<ElementRef>('input');
  imagePicker = viewChild<ElementRef<HTMLInputElement>>('imagePicker');
  selectedImage: string | null = null;

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

  get isActive() {
    return this.userForm.get('isActive');
  }

  get image() {
    return this.userForm.get('image');
  }

  get destinations(): FormArray {
    return this.userForm.get('destinations') as FormArray;
  }

  ngOnInit(): void {
    this.initializedUserForm();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.inputField()?.nativeElement.blur();
      this.name?.markAsUntouched();
    });
  }

  onGoBack() {
    this.dialogRef?.close();
  }

  selectImage() {
    this.imagePicker()?.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

      if (!allowedTypes.includes(file.type)) {
        this.toaster.error('Nepovolený formát! Povoleny jsou pouze JPG, PNG, GIF, nebo WEBP.');
        this.imagePicker()!.nativeElement.value = '';
        return;
      }

      if (file.size > 1 * 1024 * 1024) {
        this.toaster.error('Soubor je příliš velký! Maximální velikost je 1 MB.');
        this.imagePicker()!.nativeElement.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage = reader.result as string;
        this.image?.setValue(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(event: MouseEvent) {
    event.stopPropagation();
    this.selectedImage = null;
    this.imagePicker()!.nativeElement.value = '';
    this.image?.setValue(this.user().image !== '' ? this.user().image : null);
  }

  onSubmit() {
    if (this.userForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.userForm.disable();
    let _user = this.userForm.value;
    _user.id = this.user().id;
    _user.nick = _user.name!.substring(0, 1) + _user.surname!.substring(0, 1);

    let fmPositions = this.getPositions(0);
    let ovaPositions = this.getPositions(1);

    _user.destinations[0].id = this.user().destinations[0].id;
    _user.destinations[0].userId = this.user().id;
    _user.destinations[0].destination = this.user().destinations[0].destination;

    _user.destinations[1].id = this.user().destinations[1].id;
    _user.destinations[1].userId = this.user().id;
    _user.destinations[1].destination = this.user().destinations[1].destination;

    _user.destinations[0].positions[0].position = (fmPositions.at(0)).get('position')?.value ? 'Cook' : '';
    _user.destinations[0].positions[0].userDestinationId = (this.destinations.at(0)).get('id')?.value;
    _user.destinations[0].positions[0].id = (fmPositions.at(0)).get('id')?.value;

    _user.destinations[0].positions[1].position = (fmPositions.at(1)).get('position')?.value ? 'Driver' : '';
    _user.destinations[0].positions[1].userDestinationId = (this.destinations.at(0)).get('id')?.value;
    _user.destinations[0].positions[1].id = (fmPositions.at(1)).get('id')?.value;

    _user.destinations[1].positions[0].position = (ovaPositions.at(0)).get('position')?.value ? 'Cook' : '';
    _user.destinations[1].positions[0].userDestinationId = (this.destinations.at(1)).get('id')?.value;
    _user.destinations[1].positions[0].id = (ovaPositions.at(0)).get('id')?.value;

    _user.destinations[1].positions[1].position = (ovaPositions.at(1)).get('position')?.value ? 'Driver' : '';
    _user.destinations[1].positions[1].userDestinationId = (this.destinations.at(1)).get('id')?.value;
    _user.destinations[1].positions[1].id = (ovaPositions.at(1)).get('id')?.value;

    if (this.user().id === 0) {
      this.actionText.set('Přidávám...');

      const subscription = this.usersService.createUser(_user).pipe(
        concatMap(response => {
          this.isLoading.set(false);
          if (response === null) {
            this.toaster.error('Něco se pokazilo, zkus to znovu.');
          } else if (response.isSuccess === false) {
            this.toaster.error(response.errorMessage);
          } else if (response.isSuccess) {
            _user.id = response.result;
            _user.password = '';
            this.usersService.setUser(_user);
            this.usersService.addUser(_user);
            this.toaster.success(`Úspěšně přidán - ${_user.name} ${_user.surname}`);
            this.userForm.reset();
            this.onGoBack();
          }
          return of();
        }),
      ).subscribe({
        next: () => {
          this.userForm.enable();
        },
        error: () => this.isLoading.set(false)
      });

      this.destroyRef.onDestroy(() => {
        subscription.unsubscribe();
      });
    } else {
      if (_user.password !== '') {
        this.confirmService.confirm('Opravdu chceš změnit heslo?')
          .then((confirmed) => {
            if (confirmed) {
              this.updateUser(_user);
            } else {
              this.isLoading.set(false);
              return;
            }
          });
      } else {
        this.updateUser(_user);
      }
    }
  }

  onDelete() {
    this.confirmService.confirm('Opravdu chceš smazat uživatele?')
      .then((confirmed) => {
        if (confirmed) {
          this.isLoading.set(true);
          this.actionText.set('Odstraňuji...');
          this.userForm.disable();
          const subscription = this.usersService.deleteUser(this.user().id).pipe(
            concatMap(response => {
              this.isLoading.set(false);
              if (response === null) {
                this.userForm.enable();
                this.toaster.error('Něco se pokazilo, zkus to znovu.');
              } else if (response.isSuccess === false) {
                this.userForm.enable();
                this.toaster.error(response.errorMessage);
              } else if (response.isSuccess) {
                this.userForm.enable();
                this.usersService.onRemoveUser(this.user().id);
                this.toaster.success(`Uživatel byl úspěšně smazán.`);
                this.onGoBack();
              }
              return of();
            }),
          ).subscribe({
            next: () => {

            },
            error: () => this.isLoading.set(false)
          });

          this.destroyRef.onDestroy(() => {
            subscription.unsubscribe();
          });
        }
      });
  }

  nothingChanged() {
    let fmDriver = this.user()!.destinations[0].positions?.find(p => p.position === 'Driver') ? true : false;
    let fmCook = this.user()!.destinations[0].positions?.find(p => p.position === 'Cook') ? true : false;

    let ovaDriver = this.user()!.destinations[1].positions?.find(p => p.position === 'Driver') ? true : false;
    let ovaCook = this.user()!.destinations[1].positions?.find(p => p.position === 'Cook') ? true : false;

    let fmPositions = this.getPositions(0);
    let ovaPositions = this.getPositions(1);

    return (this.user().name === this.userForm.value.name) &&
      (this.user().surname === this.userForm.value.surname) &&
      (this.user().email === this.userForm.value.email) &&
      (this.user().role === this.userForm.value.role) &&
      (this.userForm.value.password === '') &&
      (fmCook === (fmPositions.at(0)).get('position')?.value) &&
      (fmDriver === (fmPositions.at(1)).get('position')?.value) &&
      (ovaCook === (ovaPositions.at(0)).get('position')?.value) &&
      (ovaDriver === (ovaPositions.at(1)).get('position')?.value) &&
      this.user().isActive === this.isActive?.value &&
      this.user().image === this.image?.value
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

  isRoleDisabled(): boolean {
    return this.user().id !== 0;
  }

  ngOnDestroy() {
    this.usersService.clearUser();
  }

  getPositions(destIndex: number): FormArray {
    return this.destinations.at(destIndex).get('positions') as FormArray;
  }

  onCheckboxChange(destIndex: number, posIndex: number, event: any) {
    const control = this.getPositions(destIndex).at(posIndex).get('position');
    control?.setValue(event.checked);
  }

  private updateUser(_user: any) {
    if (this.user().role === 'Admin' || this.user().role === 'Master') {
      _user.role = this.user().role;
      _user.isActive = true;
    }
    this.actionText.set('Upravuji...');
    const subscription = this.usersService.updateUser(_user).pipe(
      concatMap(response => {
        this.isLoading.set(false);
        if (response === null) {
          this.userForm.enable();
          this.toaster.error('Něco se pokazilo, zkus to znovu.');
        } else if (response.isSuccess === false) {
          this.userForm.enable();
          this.toaster.error(response.errorMessage);
        } else if (response.isSuccess) {
          this.userForm.enable();
          this.usersService.setUser(_user);
          this.usersService.onUpdateUser(_user);
          this.toaster.success(response.result);
          this.onGoBack();
        }
        return of();
      }),
    ).subscribe({
      next: () => { },
      error: () => this.isLoading.set(false)
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  private initializedUserForm() {
    this.userForm = new FormGroup({
      'id': new FormControl({
        value: this.user().id,
        disabled: true
      }),
      'name': new FormControl({
        value: this.user().name,
        disabled: this.user().id > 0 && this.user().role !== 'User'
      }, [
        Validators.required,
        Validators.maxLength(15)
      ]
      ),
      'surname': new FormControl({
        value: this.user().surname,
        disabled: this.user().id > 0 && this.user().role !== 'User'
      }, [Validators.required,
      Validators.maxLength(20)]),
      'email': new FormControl({
        value: this.user().email,
        disabled: false
      }, [Validators.required,
      Validators.email]),
      'password': new FormControl({
        value: '',
        disabled: false
      }, []),
      'role': new FormControl({
        value: this.user().role,
        disabled: false
      }, [Validators.required]),
      'destinations': new FormArray([
        this.buildDestination('F-M', this.user().destinations.find(d => d.destination === 'F-M')),
        this.buildDestination('OVA', this.user().destinations.find(d => d.destination === 'OVA'))
      ]),
      'nick': new FormControl({
        value: this.user().nick,
        disabled: true
      }, []),
      'isActive': new FormControl({
        value: this.user().isActive,
        disabled: false
      }, []),
      'image': new FormControl({
        value: this.user().image,
        disabled: false
      }, [])
    }, { validators: CheckBoxesValidator.AtLeastOnePositionCheckedValidator });

    if (this.user().id === 0) {
      this.password?.setValidators([Validators.required, Validators.maxLength(14)]);
    } else {
      this.password?.setValidators([Validators.maxLength(14)]);
    }
    this.password?.updateValueAndValidity();
  }

  private buildDestination(destName: 'F-M' | 'OVA', existing?: UserDestination): FormGroup {
    return new FormGroup({
      id: new FormControl(existing?.id || 0),
      userId: new FormControl(existing?.userId || this.user().id),
      destination: new FormControl(destName),
      positions: new FormArray([
        this.buildPosition(existing?.positions?.find(p => p.position === 'Cook')),
        this.buildPosition(existing?.positions?.find(p => p.position === 'Driver')),
      ])
    });
  }

  private buildPosition(existing?: UserPosition): FormGroup {
    return new FormGroup({
      id: new FormControl({ value: existing?.id || 0, disabled: true }),
      userDestinationId: new FormControl(existing?.userDestinationId || 0),
      position: new FormControl({ value: existing ? true : false, disabled: this.user().role !== 'User' }),
    });
  }
}