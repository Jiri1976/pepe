import { Component, inject, input, signal } from '@angular/core';
import { WidgetUpdateComponent } from '../widget-update/widget-update.component';
import { WidgetAddComponent } from '../widget-add/widget-add.component';
import { WarehouseStore } from '../../../stores/warehouse-store/warehouse.store';
import { WarehouseItem } from '../../../models/warehouses.interface';
import { firstValueFrom } from 'rxjs';
import { ConfirmationComponent } from '../../confirmation/confirmation.component';
import { Dialog } from '@angular/cdk/dialog';

@Component({
  selector: 'app-widget',
  imports: [
    WidgetUpdateComponent,
    WidgetAddComponent,
  ],
  template: `
    <article class="container widget-card">
      @if (item().id > 0) {
        <span class="drag-grip" aria-hidden="true"><i class="bi bi-grip-vertical"></i></span>
        <span class="item-position">{{ index() + 1 }}</span>
        <p class="item-name">{{ item().name }}</p>
        <div class="widget-actions">
          <button
            type="button"
            class="settings-button"
            [attr.aria-label]="'Upravit položku ' + item().name"
            (click)="onUpdate()"
          >
            <i class="bi bi-pencil-square" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            class="delete-button"
            [attr.aria-label]="'Smazat položku ' + item().name"
            (click)="onDelete()"
          >
            <i class="bi bi-trash3" aria-hidden="true"></i>
          </button>
        </div>
      } @else {
        <app-widget-add
          [item]="item()"
          animate.enter="fast-in"
          animate.leave="fast-out"
        />
      }

      @if (updateVisible()) {
        <app-widget-update
          [(updateVisible)]="updateVisible"
          [item]="item()"
          animate.enter="fast-in"
          animate.leave="fast-out"
        />
      }
    </article>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        min-width: 0;
      }

      .container {
        position: relative;
        display: flex;
        width: 100%;
        min-width: 0;
        min-height: 62px;
        align-items: center;
        gap: 12px;
        box-sizing: border-box;
        padding: 10px 12px;
        overflow: hidden;
        border: 1px solid #e8e5e4;
        border-radius: 13px;
        background: #fff;
        box-shadow: 0 3px 12px rgba(41, 37, 36, 0.035);
        cursor: move;
        transition: border-color 150ms ease, box-shadow 150ms ease;

        &:hover {
          border-color: #d6d3d1;
          box-shadow: 0 6px 16px rgba(41, 37, 36, 0.08);
        }

        .drag-grip {
          display: grid;
          width: 20px;
          height: 28px;
          flex: 0 0 20px;
          place-items: center;
          color: #a8a29e;
          cursor: grab;

          .bi {
            font-size: 16px;
          }
        }

        .item-position {
          display: grid;
          width: 30px;
          height: 30px;
          flex: 0 0 30px;
          place-items: center;
          border-radius: 9px;
          background: #fff1e8;
          color: #c2410c;
          font-size: 10px;
          font-weight: 700;
        }

        .item-name {
          min-width: 0;
          flex: 1 1 auto;
          margin: 0;
          overflow: hidden;
          color: #292524 !important;
          font-family: "Montserrat", sans-serif;
          font-size: 12px;
          font-weight: 600;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .widget-actions {
          display: flex;
          flex: 0 0 auto;
          align-items: center;
          gap: 6px;
        }

        .settings-button,
        .delete-button {
          display: grid;
          width: 34px;
          height: 34px;
          place-items: center;
          border: 1px solid transparent;
          border-radius: 10px;
          cursor: pointer;
          transition: background 140ms ease, color 140ms ease, border-color 140ms ease;

          &:focus-visible {
            outline: 3px solid rgba(249, 115, 22, 0.25);
            outline-offset: 2px;
          }

          .bi {
            font-size: 13px;
          }
        }

        .settings-button {
          border-color: #e7e5e4;
          background: #fff;
          color: #57534e;

          &:hover {
            border-color: #fed7aa;
            background: #fff1e8;
            color: #c2410c;
          }
        }

        .delete-button {
          border-color: #fecdd3;
          background: #fff1f2;
          color: #be123c;

          &:hover {
            background: #be123c;
            color: #fff;
          }
        }

        @media (max-width: 480px) {
          min-height: 56px;
          gap: 7px;
          padding: 8px;

          .drag-grip {
            width: 15px;
            flex-basis: 15px;
          }

          .item-position {
            width: 26px;
            height: 26px;
            flex-basis: 26px;
            font-size: 9px;
          }

          .item-name {
            font-size: 10px;
          }

          .widget-actions {
            gap: 4px;
          }

          .settings-button,
          .delete-button {
            width: 29px;
            height: 29px;
            border-radius: 8px;
          }
        }
      }
    `,
  ],
})
export class WidgetComponent {
  private dialog = inject(Dialog);
  readonly store = inject(WarehouseStore);
  updateVisible = signal(false);
  item = input.required<WarehouseItem>();
  index = input.required<number>();

  onUpdate() {
    this.updateVisible.set(true);
  }

  async onDelete() {
    if (this.item().id <= 0) {
      this.store.removeWarehouseItem(this.item());
    } else {
      const dialogRef = this.dialog.open<boolean>(ConfirmationComponent, {
        disableClose: false,
        data: { text: `Opravdu smazat položku ${this.item().name}?` },
      });
      const result = await firstValueFrom(dialogRef.closed);

      if (result !== true) {
        return;
      }

      this.store.deleteWarehouseItem(this.item());
    }
  }
}
