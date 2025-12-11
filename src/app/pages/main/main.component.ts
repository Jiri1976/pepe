import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HideElementDirective } from '../../directives/hide-element.directive';
import { ProposalsService } from '../../services/proposals.service';
import { WarehouseService } from '../../services/warehouse.service';
import { AuthStore } from '../../stores/auth-store/auth.store';

@Component({
  selector: 'app-main',
  imports: [RouterLink, HideElementDirective, RouterOutlet],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export default class MainComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  private proposalsService = inject(ProposalsService);
  private warehouseService = inject(WarehouseService);

  ngOnInit(): void {
    if (this.authStore.user()?.role === 'Admin') {
      this.proposalsService.destination.set('F-M');
      this.warehouseService.destination.set('F-M');
    } else {
      this.proposalsService.destination.set(this.authStore.user()!.destination);
      this.warehouseService.destination.set(this.authStore.user()!.destination);
    }
    this.proposalsService.resetCalendars();
  }
}