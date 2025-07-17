import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HideElementDirective } from '../../directives/hide-element.directive';
import { ProposalsService } from '../../services/proposals.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main',
  imports: [RouterLink, HideElementDirective, RouterOutlet],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  private proposalsService = inject(ProposalsService);
  private authService = inject(AuthService);
  user = computed(() => this.authService.user());

  ngOnInit(): void {
    if (this.user().role === 'Admin') {
      this.proposalsService.destination.set('F-M');
    } else {
      this.proposalsService.destination.set(this.user().destination);
    }
    this.proposalsService.resetCalendars();
  }
}