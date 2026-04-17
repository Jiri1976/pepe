import { Component, inject, input, signal } from '@angular/core';
import { WidgetUpdateComponent } from "../widget-update/widget-update.component";
import { CdkDrag, CdkDragPlaceholder } from '@angular/cdk/drag-drop';
import { WidgetAddComponent } from "../widget-add/widget-add.component";
import { WarehouseStore } from '../../../stores/warehouse-store/warehouse.store';
import { WarehouseItem } from '../../../models/warehouses.interface';

@Component({
  selector: 'app-widget',
  imports: [WidgetUpdateComponent, CdkDrag, CdkDragPlaceholder, WidgetAddComponent],
  template: `
      <div class="container drag-item d-flex flex-row align-items-center justify-content-between position-relative" cdkDrag>
        @if (item().id > 0) {
        <p>{{item().name}}</p>
        <div class="buttons d-flex flex-row align-items-center justify-content-between">
            <button class="settings-button d-flex flex-column justify-content-center align-items-center"
                (click)="onUpdate()"><i class="bi bi-pencil-square"></i></button>
            <button class="delete-button d-flex flex-column justify-content-center align-items-center"
                (click)="onDelete()"><i class="bi bi-trash"></i></button>
        </div>
        } @else {
        <app-widget-add [item]="item()" animate.enter="fast-in" animate.leave="fast-out" />
        }

        @if (updateVisible()) {
        <app-widget-update [(updateVisible)]="updateVisible" [item]="item()" animate.enter="fast-in"
            animate.leave="fast-out" />
        }
        <div *cdkDragPlaceholder></div>
      </div>
  `,
  styles: [`
    :host {
    display: block;
    }

    .container {
        height: 40px;
        width: 400px;
        padding: 10px 20px;
        overflow: hidden;
        background: var(--white);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        border: none;
        margin: 5px 20px;
        cursor: move;
        border-radius: 7px;

        p {
            margin: 0;
            color: var(--main-dark) !important;
            font-weight: 500;
        }

        .settings-button,
        .delete-button {
            border: none;
            background: var(--white);
            border-radius: 50%;
            height: 28px;
            width: 28px;
            color: var(--main-dark);
            transition: all .3s ease-in-out;
        }

        .settings-button:hover {
            background: var(--main-dark);
            color: var(--white);
        }

        .delete-button:hover {
            background: var(--main-red);
            color: var(--white);
        }
    }
    `]
})
export class WidgetComponent {
  readonly store = inject(WarehouseStore);
  updateVisible = signal(false);
  item = input.required<WarehouseItem>();
  index = input.required<number>();

  onUpdate() {
    this.updateVisible.set(true);
  }

  onDelete() {
    if (this.item().id <= 0) {
      this.store.removeWarehouseItem(this.item());
    } else {
      this.store.requestDeleteWarehouseItem(this.item());
    }
  }
}
