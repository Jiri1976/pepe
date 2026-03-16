import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, ElementRef, inject, OnInit, viewChild } from '@angular/core';
import Swiper from 'swiper';
import { CommonModule } from '@angular/common';
import { HideElementDirective } from '../../../directives/hide-element.directive';
import { WarehouseInputComponent } from "../warehouse-input/warehouse-input.component";
import { WarehouseStore } from '../../../stores/warehouse-store/warehouse.store';
import { AuthStore } from '../../../stores/auth-store/auth.store';

@Component({
  selector: 'app-warehouse-units',
  imports: [CommonModule, HideElementDirective, WarehouseInputComponent],
  templateUrl: './warehouse-units.component.html',
  styleUrl: './warehouse-units.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WarehouseUnitsComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly warehouseStore = inject(WarehouseStore);
  cards = this.warehouseStore.cards;
  destination = this.warehouseStore.destination;
  swiperRef = viewChild<ElementRef>('swiperRef');

  ngOnInit(): void {
    const user = this.authStore.user();
    if (user?.role === 'master' && user.destination !== this.warehouseStore.destination()) {
      this.warehouseStore.setDestination(user.destination);
    }
    this.warehouseStore.resetMonthYaer();
    this.warehouseStore.setWarehouseNave('units');
    this.warehouseStore.getWarehouseCards();
  }

  slideToEffect = effect(() => {
    const index = this.warehouseStore.consumeSlideToIndex();
    if (index === null) return;
    const swiper = this.swiperRef()?.nativeElement?.swiper;
    if (swiper) {
      swiper.slideTo(index);
    }
  });

  onSwiperInit(event: any) {
    setTimeout(() => {
      const swiper = (this.swiperRef()?.nativeElement as any).swiper;
      if (swiper) {
        swiper.on('slideChange', () => {
        });
      }
    });
  }

  onSlideChange(event: Event) {
    const swiperInstance = (event.target as any).swiper as Swiper;
    this.warehouseStore.setSlideIndex(swiperInstance.activeIndex);
  }
}
