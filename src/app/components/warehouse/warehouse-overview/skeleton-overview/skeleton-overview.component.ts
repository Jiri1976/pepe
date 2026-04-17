import { Component, inject } from '@angular/core';
import { WarehouseStore } from '../../../../stores/warehouse-store/warehouse.store';

@Component({
    selector: 'app-skeleton-overview',
    template: `
          <div class="skeleton d-flex flex-column justify-content-center" animate.enter="fade-in" animate.leave="fade-out">
            <div class="empty-table">
              <div class="empty-table-head d-flex flex-row">
                  <div class="empty-first-head-cell"></div>
                  @for (day of days(); track $index) {
                  <div class="empty-head-cell"></div>
                  }
              </div>
              <div class="empty-body">
                  @for(card of emptyCards; track $index) {
                  <div class="empty-table-row d-flex flex-row">
                      <div class="empty-first-table-cell"></div>
                      @for (day of days(); track $index) {
                      <div class="empty-cell">
                      </div>
                      }
                  </div>
                  }
              </div>
            </div>
          </div>
    `,
    styles: [`
            .skeleton {
            grid-column: 1;
            grid-row: 1;
            margin: 130px 0 0 0;

            .empty-table {
                .empty-table-head {
                    margin-bottom: 10px;

                    .empty-first-head-cell {
                        min-width: 150px !important;
                        margin-right: 10px;
                        border: 1px solid #666;
                        height: 35px !important;
                        background: linear-gradient(90deg,
                                #eee 25%,
                                #fff 50%,
                                #eee 75%);
                        background-size: 400% 100%;
                        animation: shimmer 2s infinite linear;
                        border-radius: 7px;
                    }

                    .empty-head-cell {
                        border: 1px solid #666;
                        width: 35px !important;
                        height: 35px !important;
                        margin-right: 2px;
                        background: linear-gradient(90deg,
                                #eee 25%,
                                #fff 50%,
                                #eee 75%);
                        background-size: 400% 100%;
                        animation: shimmer 2s infinite linear;
                        border-radius: 5px;
                    }
                }

                .empty-body {
                    .empty-table-row {
                        margin: 5px 0;

                        .empty-first-table-cell {
                            height: 35px;
                            width: 150px !important;
                            border: 1px solid #666;
                            margin-right: 10px;
                            background: linear-gradient(90deg,
                                    #eee 25%,
                                    #fff 50%,
                                    #eee 75%);
                            background-size: 400% 100%;
                            animation: shimmer 2s infinite linear;
                            border-radius: 7px;
                        }

                        .empty-cell {
                            width: 35px !important;
                            height: 35px !important;
                            border: 1px solid #666;
                            margin-right: 2px;
                            background: linear-gradient(90deg,
                                    #eee 25%,
                                    #fff 50%,
                                    #eee 75%);
                            background-size: 400% 100%;
                            animation: shimmer 2s infinite linear;
                            border-radius: 5px;
                        }
                    }
                }
            }
        }

        @keyframes shimmer {
            0% {
                background-position: -200% 0;
            }

            100% {
                background-position: 200% 0;
            }
        }
  `],
})
export class SkeletonOverviewComponent {
    readonly store = inject(WarehouseStore);
    days = this.store.countOfDays;
    emptyCards = Array(12);
}
