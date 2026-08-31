import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { HideElementDirective } from '../../../directives/hide-element.directive';
import { AuthStore } from '../../../stores/auth-store/auth.store';
import { WarehouseStore } from '../../../stores/warehouse-store/warehouse.store';
import { DestinationButtonComponent } from '../../paging/destination-button.component';
import { PagingComponent } from '../../paging/paging.component';
import { PrevNextButtonComponent } from '../../paging/prev-next-button.component';
import { WarehouseInputComponent } from '../warehouse-input/warehouse-input.component';

@Component({
  selector: 'app-warehouse-units',
  imports: [
    CommonModule,
    HideElementDirective,
    WarehouseInputComponent,
    PagingComponent,
    PrevNextButtonComponent,
    DestinationButtonComponent,
  ],
  templateUrl: './warehouse-units.component.html',
  styleUrls: ['./warehouse-units.component.scss'],
})
export class WarehouseUnitsComponent implements OnInit, OnDestroy {
  readonly authStore = inject(AuthStore);
  readonly warehouseStore = inject(WarehouseStore);
  readonly cards = this.warehouseStore.cards;
  readonly destination = this.warehouseStore.destination;
  readonly activeSlide = signal(0);
  readonly revealedSlide = signal(0);
  readonly revealFromTopRight = signal(false);
  private firstFrame?: number;
  private secondFrame?: number;

  ngOnInit(): void {
    const user = this.authStore.user();

    if (
      user?.role === 'Master' &&
      user.destination !== this.warehouseStore.destination()
    ) {
      this.warehouseStore.setDestination(user.destination);
    }

    this.warehouseStore.resetMonthYaer();
    this.warehouseStore.setWarehouseNave('units');
    this.warehouseStore.getWarehouseCards();
  }

  ngOnDestroy(): void {
    if (this.firstFrame) cancelAnimationFrame(this.firstFrame);
    if (this.secondFrame) cancelAnimationFrame(this.secondFrame);
  }

  readonly syncClipSlide = effect(() => {
    const requestedIndex = this.warehouseStore.consumeSlideToIndex();
    if (requestedIndex === null) return;

    const lastIndex = this.cards().length - 1;
    const index = Math.max(0, Math.min(requestedIndex, lastIndex));
    const currentIndex = this.activeSlide();
    const fromTopRight = index < currentIndex;

    this.showSlide(index, fromTopRight);
    this.warehouseStore.setSlideIndex(index);
  });

  private showSlide(index: number, fromTopRight: boolean): void {
    if (index < 0 || index >= this.cards().length) return;

    if (this.firstFrame) cancelAnimationFrame(this.firstFrame);
    if (this.secondFrame) cancelAnimationFrame(this.secondFrame);

    this.activeSlide.set(index);
    this.revealFromTopRight.set(fromTopRight);

    this.firstFrame = requestAnimationFrame(() => {
      this.secondFrame = requestAnimationFrame(() => {
        this.revealedSlide.set(index);
      });
    });
  }

  movePrevious(): void {
    if (this.warehouseStore.sliceIndex() === 0) return;

    this.warehouseStore.slideTo(this.warehouseStore.sliceIndex() - 1);
  }

  moveNext(): void {
    if (this.warehouseStore.sliceIndex() === this.cards().length - 1) return;

    this.warehouseStore.slideTo(this.warehouseStore.sliceIndex() + 1);
  }
}
