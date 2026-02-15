import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HideElementDirective } from '../../directives/hide-element.directive';
import { WarehouseService } from '../../services/warehouse.service';
import { AuthStore } from '../../stores/auth-store/auth.store';
import { ProposalStore } from '../../stores/proposal-store/proposal.store';
import { ShiftsStore } from '../../stores/shifts-store/shifts.store';

@Component({
  selector: 'app-main',
  imports: [RouterLink, HideElementDirective, RouterOutlet],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export default class MainComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly propStore = inject(ProposalStore);
  readonly shiftsStore = inject(ShiftsStore);
  private warehouseService = inject(WarehouseService);

  ngOnInit(): void {
    if (this.authStore.user()?.role === 'Admin') {
      this.propStore.setDestination('F-M');
      this.shiftsStore.setDestination('F-M');
      this.warehouseService.destination.set('F-M');
    } else {
      this.propStore.setDestination(this.authStore.user()!.destination);
      this.shiftsStore.setDestination(this.authStore.user()!.destination);
      this.warehouseService.destination.set(this.authStore.user()!.destination);
    }
    this.propStore.resetCalendar();
  }
}