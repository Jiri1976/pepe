import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FieldsetModule } from 'primeng/fieldset';
import { CheckboxModule } from 'primeng/checkbox';
import { ToasterService } from '../../../services/toaster.service';
import { UsersStore } from '../../../stores/user-store/users.store';
import { customError, disabled, email, Field, FieldState, form, maxLength, required, validate } from '@angular/forms/signals';
import { INITIAL_USER, User } from '../../../models/users/user.interface';
import { environment } from '../../../../environments/environment';
import { ConfirmationComponent } from "../../confirmation/confirmation.component";

interface Positions {
  fmDriver: boolean;
  fmCook: boolean;
  ovaDriver: boolean;
  ovaCook: boolean;
}

interface UForm {
  id: number;
  name: string;
  surname: string;
  email: string;
  password: string;
  role: string;
  destinations: Positions;
  isActive: boolean;
  image: string;
}

function atLeastOnePositionSelected(destinations: Positions) {
  if (!destinations.fmDriver && !destinations.fmCook && !destinations.ovaDriver && !destinations.ovaCook) {
    return customError({
      kind: 'destinationsInvalid',
      message: 'Musí být vybrána alespoň jedna pozice',
    });
  }
  return null;
}

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [FieldsetModule, CheckboxModule, Field, ConfirmationComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {
  readonly store = inject(UsersStore);
  private toaster = inject(ToasterService);
  user = this.store.selectedUser!;
  imagePicker = viewChild<ElementRef<HTMLInputElement>>('imagePicker');
  selectedImage: string | null = null;
  selectedImageName = this.user()?.imageName ?? null;
  selectedFile: File | undefined = undefined;
  apiUrl = environment.apiUrl;
  confirmationOpened = signal(false);
  confirmationText = signal('');
  confirmationAction = signal<string>('');

  protected model = signal<UForm>({
    id: this.user()!.id,
    name: this.user()!.name,
    surname: this.user()!.surname,
    email: this.user()!.email,
    password: '',
    role: this.user()!.role,
    destinations: this.createPositions(),
    isActive: this.user()!.isActive,
    image: this.user()?.image ?? ''
  });

  protected form = form(this.model, s => {
    required(s.name, { message: 'Jméno je povinný údaj' });
    maxLength(s.name, 15, { message: 'Pouze 15 znaků' });
    required(s.surname, { message: 'Příjmení je povinný údaj' });
    maxLength(s.surname, 20, { message: 'Pouze 20 znaků' });
    required(s.email, { message: 'Email je povinný údaj' });
    email(s.email, { message: 'Email má špatný formát' });
    required(s.role, { message: 'Role je povinný údaj' });
    disabled(s.role, ({ valueOf }) => valueOf(s.id) !== 0);
    required(s.password, {
      message: 'Heslo je povinný údaj',
      when: ({ valueOf }) => valueOf(s.id) === 0
    });
    maxLength(s.password, 14, { message: 'Max. 14 znaků' });
    required(s.destinations, {
      message: 'Musí existovat destinace'
    });
    validate(
      s.destinations,
      ({ value }) => atLeastOnePositionSelected(value())
    );
  });

  onGoBack() {
    this.store.selectUser(INITIAL_USER);
    this.store.close();
  }

  selectImage() {
    this.imagePicker()?.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

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
      this.selectedFile = file;
      this.selectedImageName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(event: MouseEvent) {
    event.stopPropagation();
    this.selectedImage = null;
    this.imagePicker()!.nativeElement.value = '';
    let _user = { ...this.user()! };
    _user.image = null;
    _user.imageName = undefined;
    this.selectedImageName = null;
    this.store.removeImage(_user);
    this.selectedFile = undefined;
  }

  onSubmit() {
    if (this.form().invalid()) {
      return;
    }
    let _user = { ...this.user()! };
    _user.nick = this.form().value().name.substring(0, 1) + this.form().value().surname!.substring(0, 1);
    _user.name = this.form().value().name;
    _user.surname = this.form().value().surname;
    _user.email = this.form().value().email;
    _user.password = this.form().value().password;
    _user.role = this.form().value().role;

    this.refreshPositions(_user, 'F-M', 'Driver', this.form().value().destinations.fmDriver);
    this.refreshPositions(_user, 'F-M', 'Cook', this.form().value().destinations.fmCook);
    this.refreshPositions(_user, 'OVA', 'Driver', this.form().value().destinations.ovaDriver);
    this.refreshPositions(_user, 'OVA', 'Cook', this.form().value().destinations.ovaCook);

    _user.isActive = this.form().value().isActive;
    _user.image = this.selectedFile ? null : _user.image;
    _user.imageFile = this.selectedFile;
    _user.imageName = this.selectedFile ? undefined : _user.imageName;

    if (this.user()!.id === 0) {
      this.store.createUser(_user);
    } else {
      if (this.user()?.role === 'Admin' || this.user()?.role === 'Master') {
        _user.role = this.user()!.role;
        _user.isActive = true;
      }
      this.store.updateUser(_user);
    }
  }

  refreshPositions(user: User, destination: 'F-M' | 'OVA', position: 'Driver' | 'Cook', checked: boolean) {
    let _destination = user.destinations.find(d => d.destination === destination)!;
    const positionExists = _destination.positions?.find(p => p.position === position);

    if (positionExists) {
      user.destinations.find(d => d.destination === destination)!.positions!.find(p => p.id === positionExists.id)!.position = checked ? position : null
    } else {
      if (checked) {
        user.destinations.find(d => d.destination === destination)!.positions!.push({
          id: 0,
          userDestinationId: this.user()!.destinations[0].positions?.find(p => p.position === position)?.userDestinationId ?? 0,
          position: position
        })
      }
    }
    return user;
  }

  onDelete() {
    this.confirmationText.set('Opravdu chceš smazat uživatele?');
    this.confirmationOpened.set(true);
    this.confirmationAction.set('delete-user');
  }

  doConfirmedAction() {
    this.confirmationText.set('');
    this.confirmationOpened.set(false);
    if (this.confirmationAction() === 'delete-user') {
      this.store.deleteUser();
      this.confirmationAction.set('');
    }
  }

  nothingChanged() {
    let fmDriver = this.user()?.destinations[0].positions?.find(p => p.position === 'Driver') ? true : false;
    let fmCook = this.user()?.destinations[0].positions?.find(p => p.position === 'Cook') ? true : false;
    let ovaDriver = this.user()?.destinations[1].positions?.find(p => p.position === 'Driver') ? true : false;
    let ovaCook = this.user()?.destinations[1].positions?.find(p => p.position === 'Cook') ? true : false;

    return (this.user()?.name === this.form().value().name) &&
      (this.user()?.surname === this.form().value().surname) &&
      (this.user()?.email === this.form().value().email) &&
      (this.user()?.role === this.form().value().role) &&
      (this.form().value().password === '') &&
      (fmCook === this.form().value().destinations.fmCook) &&
      (fmDriver === this.form().value().destinations.fmDriver) &&
      (ovaCook === this.form().value().destinations.ovaCook) &&
      (ovaDriver === this.form().value().destinations.ovaDriver) &&
      this.user()?.isActive === this.form().value().isActive &&
      this.user()?.imageName === this.selectedImageName;
  }

  createPositions() {
    return {
      fmDriver: this.user()?.destinations.find(d => d.destination === 'F-M')?.positions?.find(p => p.position === 'Driver')?.position === 'Driver',
      fmCook: this.user()?.destinations.find(d => d.destination === 'F-M')?.positions?.find(p => p.position === 'Cook')?.position === 'Cook',
      ovaDriver: this.user()?.destinations.find(d => d.destination === 'OVA')?.positions?.find(p => p.position === 'Driver')?.position === 'Driver',
      ovaCook: this.user()?.destinations.find(d => d.destination === 'OVA')?.positions?.find(p => p.position === 'Cook')?.position === 'Cook'
    }
  }

  protected getError = (field: FieldState<string, string>) => {
    if (!(field.touched() && field.dirty())) {
      return null;
    }
    const errors = field.errors();
    const required = errors.find(e => e.kind === 'required');
    if (required) {
      return required.message;
    }
    const invalid = errors.find(e => e.kind === 'email');
    if (invalid) {
      return invalid.message;
    }
    const maxLength = errors.find(e => e.kind === 'maxLength');
    if (maxLength) {
      return maxLength.message;
    }
    return null;
  };
}