import { Component, computed, effect, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { PageAnimation } from '../../animations/page.animation';

@Component({
  selector: 'app-header',
  imports: [ButtonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  animations: [
    PageAnimation
  ]
})
export class HeaderComponent {
  private authService = inject(AuthService);
  user = computed(() => this.authService.user());

  constructor() {
    effect(() => { });
  }

  onLogout() {
    this.authService.logout();
  }
}
