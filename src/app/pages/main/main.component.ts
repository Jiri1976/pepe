import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HideElementDirective } from '../../directives/hide-element.directive';
import { ProposalsService } from '../../services/proposals.service';
import { AuthService } from '../../services/auth.service';
import { WarehouseService } from '../../services/warehouse.service';

@Component({
  selector: 'app-main',
  imports: [RouterLink, HideElementDirective, RouterOutlet],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export default class MainComponent implements OnInit {
  private proposalsService = inject(ProposalsService);
  private warehouseService = inject(WarehouseService);
  private authService = inject(AuthService);
  user = computed(() => this.authService.user());

  ngOnInit(): void {
    if (this.user().role === 'Admin') {
      this.proposalsService.destination.set('F-M');
      this.warehouseService.destination.set('F-M');
    } else {
      this.proposalsService.destination.set(this.user().destination);
      this.warehouseService.destination.set(this.user().destination);
      console.log(this.user());

    }
    this.proposalsService.resetCalendars();
  }
}