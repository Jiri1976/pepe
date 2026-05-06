import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FieldsetModule } from 'primeng/fieldset';
import { CheckboxModule } from 'primeng/checkbox';
import { UsersStore } from '../../../stores/user-store/users.store';
import { email, FormField, form, required, validate } from '@angular/forms/signals';
import { INITIAL_USER, User, UserDestination } from '../../../models/users.interface';
import { environment } from '../../../../environments/environment';
import { FieldWrapperComponent } from "../../filed-wrapper/field-wrapper.component";
import { FieldStyleDirective } from '../../../directives/field-styling.directive';
import { maxLenValidator } from '../../../helpers/common-functions.helper';

const DESTINATIONS = ['F-M', 'OVA'] as const;
const POSITIONS = ['Driver', 'Cook', 'Helper', 'Pizza'] as const;

type Destination = typeof DESTINATIONS[number];
type Position = typeof POSITIONS[number];

interface Positions {
  fmDriver: boolean;
  fmCook: boolean;
  fmHelper: boolean;
  fmPizza: boolean;
  ovaDriver: boolean;
  ovaCook: boolean;
  ovaHelper: boolean;
  ovaPizza: boolean;
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
  const hasAny = Object.values(destinations).some(Boolean);

  return hasAny
    ? null
    : {
      kind: 'destinationsInvalid',
      message: 'Musí být vybrána alespoň jedna pozice',
    };
}

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [FieldsetModule, CheckboxModule, FormField, FieldWrapperComponent, FieldStyleDirective],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {
  readonly usersStore = inject(UsersStore);
  USER_MAX_NAME = 15;
  USER_MAX_SURNAME = 20;
  USER_MAX_PASSWORD = 14;
  user = this.usersStore.selectedUser!;
  imagePicker = viewChild<ElementRef<HTMLInputElement>>('imagePicker');
  selectedFile = signal<File | undefined>(undefined);
  selectedImageName = signal<string | null>(this.user()?.imageName ?? null);
  selectedImage = signal<string | null>(null);
  apiUrl = environment.apiUrl;

  readonly isUnchanged = computed(() => {
    const original = this.originalUser();
    const current = this.formSnapshot();

    if (!original) return true;

    if (this.imageChangeIntent() !== 'unchanged') {
      return false;
    }

    if (this.originalUser()!.id > 0 && this.form().value().password.length > 0) {
      return false;
    }

    return (
      original.name === current.name &&
      original.surname === current.surname &&
      original.email === current.email &&
      original.role === current.role &&
      original.isActive === current.isActive &&
      JSON.stringify(original.destinations) ===
      JSON.stringify(current.destinations)
    );
  });

  readonly displayedImageSrc = computed<string | null>(() => {
    if (this.selectedImage()) {
      return this.selectedImage();
    }

    if (this.selectedImageName() === null) {
      return null;
    }

    if (this.originalImageName()) {
      return `${this.apiUrl}/images/${this.user()?.image}`;
    }
    return null;
  });

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
    required(s.surname, { message: 'Příjmení je povinný údaj' });
    required(s.email, { message: 'Email je povinný údaj' });
    email(s.email, { message: 'Email má špatný formát' });
    required(s.role, { message: 'Role je povinný údaj' });
    required(s.password, {
      message: 'Heslo je povinný údaj',
      when: ({ valueOf }) => valueOf(s.id) === 0
    });
    required(s.destinations, {
      message: 'Musí existovat destinace'
    });
    validate(
      s.destinations,
      ({ value }) => atLeastOnePositionSelected(value())
    );

    validate(s.name, maxLenValidator(this.USER_MAX_NAME, `Max ${this.USER_MAX_NAME} znaků`));
    validate(s.surname, maxLenValidator(this.USER_MAX_SURNAME, `Max ${this.USER_MAX_SURNAME} znaků`));
    validate(s.password, maxLenValidator(this.USER_MAX_PASSWORD, `Max ${this.USER_MAX_PASSWORD} znaků`));
  });

  onGoBack() {
    this.usersStore.selectUser(INITIAL_USER);
    this.usersStore.close();
  }

  selectImage() {
    this.imagePicker()?.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }

    const allowedTypes = new Set([
      'image/jpeg',
      'image/jpg',
      'image/png'
    ]);

    if (!allowedTypes.has(file.type)) {
      this.usersStore.error('Nepovolený formát! Povoleny jsou pouze JPEG, JPG nebo PNG.');
      this.imagePicker()!.nativeElement.value = '';
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      this.usersStore.error('Soubor je příliš velký! Maximální velikost je 1 MB.');
      this.imagePicker()!.nativeElement.value = '';
      return;
    }
    this.selectedFile.set(file);
    this.selectedImageName.set(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      this.selectedImage.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeImage(event: MouseEvent) {
    event.stopPropagation();
    this.selectedImage.set(null);
    this.selectedImageName.set(null);
    this.selectedFile.set(undefined);
    this.imagePicker()!.nativeElement.value = '';
  }

  onReset() {
    const user = this.user();
    if (!user) {
      return;
    }

    this.model.set({
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      password: '',
      role: user.role,
      destinations: this.createPositions(),
      isActive: user.isActive,
      image: user.image ?? ''
    });

    this.form().reset();
    this.selectedImage.set(null);
    this.selectedImageName.set(user.imageName ?? null);
    this.selectedFile.set(undefined);
  }

  onSubmit() {
    if (this.form().invalid() || this.isUnchanged()) {
      return;
    }

    const v = this.form().value();
    let _user = { ...this.user()! };
    _user.nick = `${v.name[0]}${v.surname[0]}`;
    _user.name = v.name;
    _user.surname = v.surname;
    _user.email = v.email;
    _user.password = v.password;
    _user.role = v.role;
    _user.destinations = this.computedDestinations();
    _user.isActive = v.isActive;

    const imageIntent = this.imageChangeIntent();

    if (imageIntent === 'added') {
      _user.image = null;
      _user.imageFile = this.selectedFile()!;
      _user.imageName = undefined;
    }

    if (imageIntent === 'removed') {
      _user.image = null;
      _user.imageFile = undefined;
      _user.imageName = undefined;
      this.usersStore.removeImage(_user);
    }

    if (imageIntent === 'unchanged') {
      _user.imageFile = undefined;
    }

    if (this.user()!.id === 0) {
      this.usersStore.createUser(_user);
    } else {
      if (this.user()?.role === 'Admin' || this.user()?.role === 'Master') {
        _user.role = this.user()!.role;
        _user.isActive = true;
      }
      this.usersStore.updateUser(_user);
    }
  }

  refreshPositions(
    user: User,
    destination: Destination,
    position: Position,
    checked: boolean
  ) {
    const dest = user.destinations.find(d => d.destination === destination);
    if (!dest) return user;

    const existing = dest.positions?.find(p => p.position === position);

    if (checked && !existing) {
      dest.positions!.push({
        id: 0,
        userDestinationId:
          this.user()!.destinations
            .find(d => d.destination === destination)
            ?.positions?.find(p => p.position === position)
            ?.userDestinationId ?? 0,
        position
      });
    }

    if (!checked && existing) {
      existing.position = null;
    }

    return user;
  }

  onDelete() {
    this.usersStore.requestDeleteUser();
  }

  createPositions(): Positions {
    const result = {} as Positions;

    for (const destination of DESTINATIONS) {
      for (const position of POSITIONS) {
        const key = `${destination === 'F-M' ? 'fm' : 'ova'}${position}` as keyof Positions;

        result[key] =
          !!this.user()?.destinations
            .find(d => d.destination === destination)
            ?.positions?.some(p => p.position === position);
      }
    }

    return result;
  }

  private formSnapshot = computed(() => {
    const v = this.form().value();

    return {
      name: v.name,
      surname: v.surname,
      email: v.email,
      role: v.role,
      isActive: v.isActive,
      imageName: this.selectedImageName(),
      hasNewImage: !!this.selectedFile(),
      destinations: v.destinations
    };
  });

  private readonly originalImageName = signal<string | null>(
    this.user()?.imageName ?? null
  );

  private getUserDestination(
    user: User,
    destination: Destination
  ) {
    return user.destinations.find(d => d.destination === destination);
  }

  private originalUser = computed(() => {
    const u = this.user();
    if (!u) return null;

    return {
      id: u.id,
      name: u.name,
      surname: u.surname,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      imageName: u.imageName ?? null,
      destinations: this.createPositions()
    };
  });

  private computedDestinations = computed<UserDestination[]>(() => {
    const user = this.user();
    const formPositions = this.form().value().destinations;

    if (!user) return [];

    return DESTINATIONS.map(destination => {
      const existing = this.getUserDestination(user, destination)!;

      return {
        id: existing.id,
        userId: existing.userId,
        destination,
        positions: POSITIONS
          .filter(position => {
            const key =
              `${destination === 'F-M' ? 'fm' : 'ova'}${position}` as keyof Positions;
            return formPositions[key];
          })
          .map(position => {
            const existingPosition =
              existing.positions?.find(p => p.position === position);

            return {
              id: existingPosition?.id ?? 0,
              userDestinationId:
                existingPosition?.userDestinationId ?? existing.id,
              position
            };
          })
      };
    });
  });

  private imageChangeIntent = computed(() => {
    if (this.selectedFile()) return 'added';
    if (
      this.originalImageName() &&
      !this.selectedImageName()
    ) {
      return 'removed';
    }
    return 'unchanged';
  });
}