import { Component } from '@angular/core';

@Component({
  selector: 'app-warehouse-empty-overview',
  imports: [],
  templateUrl: './warehouse-empty-overview.component.html',
  styleUrl: './warehouse-empty-overview.component.scss'
})
export class WarehouseEmptyOverviewComponent {
  cards = Array(10);
  days = Array(31);
}
