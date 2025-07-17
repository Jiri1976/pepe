import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { WarehouseService } from '../../../services/warehouse.service';

@Component({
  selector: 'app-warehouse-overview',
  imports: [],
  templateUrl: './warehouse-overview.component.html',
  styleUrl: './warehouse-overview.component.scss'
})
export class WarehouseOverviewComponent implements OnInit {
  private warehouseService = inject(WarehouseService);
  cards = computed(() => this.warehouseService.cards());
  items: string[] = [];
  days = Array(0);

  // cradsEffect = effect(() => {
  //   console.log('effect');

  //   this.initData();
  // });

  ngOnInit(): void {
    this.warehouseService.warehouseNav.set('board');
    this.initData();
  }

  // ngOnDestroy() {
  //   this.warehouseService.boardIsActive.set(false);
  // }

  private initData() {
    if (this.cards().length > 0) {
      this.items = [];
      this.cards().forEach(card => {
        this.items.push(card.warehouseItemName);
      });
      this.days = Array(new Date(parseInt(this.cards()[0].monthYear.substring(2, 6)), parseInt(this.cards()[0].monthYear.substring(0, 1)), 0).getDate());
    }
  }
}
