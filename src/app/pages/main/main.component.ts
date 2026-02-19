import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HideElementDirective } from '../../directives/hide-element.directive';
import { AuthStore } from '../../stores/auth-store/auth.store';
import { ProposalStore } from '../../stores/proposal-store/proposal.store';
import { ShiftsStore } from '../../stores/shifts-store/shifts.store';
import { WarehouseStore } from '../../stores/warehouse-store/warehouse.store';

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
  readonly warehouseStore = inject(WarehouseStore);

  ngOnInit(): void {
    if (this.authStore.user()?.role === 'Admin') {
      this.propStore.setDestination('F-M');
      this.shiftsStore.setDestination('F-M');
      this.warehouseStore.setDestination('F-M');
    } else {
      this.propStore.setDestination(this.authStore.user()!.destination);
      this.shiftsStore.setDestination(this.authStore.user()!.destination);
      this.warehouseStore.setDestination(this.authStore.user()!.destination);
    }
    this.propStore.resetCalendar();
  }
}