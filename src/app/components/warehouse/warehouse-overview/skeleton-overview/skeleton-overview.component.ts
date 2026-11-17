import { Component, inject } from '@angular/core';
import { WarehouseStore } from '../../../../stores/warehouse-store/warehouse.store';

@Component({
  selector: 'app-skeleton-overview',
  template: `
    <div class="skeleton-overview" aria-hidden="true">
      <div class="skeleton-scroll">
        <div class="skeleton-table">
          <div class="skeleton-head">
            <span class="skeleton item-head"></span>
            @for (day of days(); track $index) {
              <span class="skeleton day-head"></span>
            }
          </div>
          @for (row of emptyCards; track $index) {
            <div class="skeleton-row">
              <span class="skeleton item-name"></span>
              @for (day of days(); track $index) {
                <span class="skeleton amount"></span>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
      }

      .skeleton-overview {
        width: max-content;
        min-width: 0;
        max-width: 100%;
        box-sizing: border-box;
        margin: 0 auto 0;
        overflow: hidden;
        border: 1px solid #e8e5e4;
        border-radius: 15px;
        background: #fff;
        box-shadow: 0 8px 26px rgba(41, 37, 36, 0.07);
      }

      .skeleton-scroll {
        max-height: calc(100dvh - 170px);
        overflow: auto;
        overscroll-behavior: contain;
        scrollbar-width: thin;
      }

      .skeleton-table {
        width: max-content;
      }

      .skeleton-head,
      .skeleton-row {
        display: flex;
        width: max-content;
      }

      .skeleton-head {
        position: sticky;
        top: 0;
        z-index: 5;
        padding-bottom: 5px;
        background: #fff;
      }

      .skeleton {
        display: block;
        background: linear-gradient(90deg, #eee 25%, #fff 50%, #eee 75%);
        background-size: 400% 100%;
        animation: skeleton-shimmer 1.8s linear infinite;
      }

      .item-head,
      .item-name {
        position: sticky;
        left: 0;
        z-index: 4;
        flex: 0 0 190px;
        width: 190px;
        min-width: 190px;
      }

      .item-head {
        z-index: 5;
        height: 42px;
        border-radius: 12px 0 0 0;
      }

      .day-head,
      .amount {
        flex: 0 0 38px;
        width: 38px;
        min-width: 38px;
      }

      .day-head {
        height: 42px;
        margin-left: 1px;
      }

      .item-name,
      .amount {
        height: 43px;
        border-bottom: 1px solid #eeecea;
      }

      .item-name {
        margin-right: 1px;
      }

      .amount {
        margin-left: 1px;
      }

      @keyframes skeleton-shimmer {
        from {
          background-position: -200% 0;
        }
        to {
          background-position: 200% 0;
        }
      }

      @media (max-width: 690px) {
        .skeleton-overview {
          width: 100%;
          border-radius: 12px;
        }

        .skeleton-scroll {
          max-height: calc(100dvh - 160px);
        }

        .item-head,
        .item-name {
          flex-basis: 148px;
          width: 148px;
          min-width: 148px;
        }

        .day-head,
        .amount {
          flex-basis: 36px;
          width: 36px;
          min-width: 36px;
        }
      }
    `,
  ],
})
export class SkeletonOverviewComponent {
  readonly store = inject(WarehouseStore);
  days = this.store.countOfDays;
  emptyCards = Array(12);
}
