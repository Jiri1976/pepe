import { Component, inject } from '@angular/core';
import { AuthStore } from '../../stores/auth-store/auth.store';

@Component({
  selector: 'app-select-destination',
  imports: [],
  templateUrl: './select-destination.component.html',
  styleUrl: './select-destination.component.scss',
})
export class SelectDestinationComponent {
  private readonly authStore = inject(AuthStore);

  selectDestination(destination: string) {
    this.authStore.selectDestination(destination);
  }
}
