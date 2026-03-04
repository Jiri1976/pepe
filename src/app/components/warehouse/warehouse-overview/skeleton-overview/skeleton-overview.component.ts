import { Component, inject } from '@angular/core';
import { WarehouseStore } from '../../../../stores/warehouse-store/warehouse.store';

@Component({
  selector: 'app-skeleton-overview',
  imports: [],
  templateUrl: './skeleton-overview.component.html',
  styleUrl: './skeleton-overview.component.scss',
})
export class SkeletonOverviewComponent {
  readonly store = inject(WarehouseStore);
  days = this.store.countOfDays;
  emptyCards = Array(12);
}
