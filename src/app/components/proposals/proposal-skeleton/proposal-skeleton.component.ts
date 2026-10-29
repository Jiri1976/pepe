import {
  Component,
  computed,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { ProposalStore } from '../../../stores/proposal-store/proposal.store';
import { AuthStore } from '../../../stores/auth-store/auth.store';

import { TableModule } from 'primeng/table';
import { Bars } from '@primeicons/angular/bars';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-proposal-skeleton',
  imports: [TableModule, TagModule],
  template: `
    <div class="wrapper">
      <div class="p-table-wrapper">
        <p-table
          [value]="emptyUsers"
          [scrollable]="true"
          [scrollHeight]="scrollHeight()"
          [tableStyle]="{ width: tableWidth(), 'table-layout': 'fixed' }"
          style="position: relative"
        >
          <ng-template #header>
            <tr>
              <th pFrozenColumn id="first"></th>

              <th pFrozenColumn id="head"></th>
              @for (shift of emptyDays; track $index) {
                <th class="day"></th>
              }

              <th class="last"></th>
            </tr>
          </ng-template>
          <ng-template #body>
            <tr>
              <td pFrozenColumn class="first"></td>
              <td pFrozenColumn class="user-head"></td>

              @for (shift of emptyDays; track $index) {
                <td class="day"></td>
              }

              <td class="last"></td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
  styles: [
    `
      .wrapper {
        grid-column: 1;
        grid-row: 1;
        margin-top: 90px;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
        padding-inline: 70px;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: center;

        .p-table-wrapper {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          margin: 0 auto;
          overflow: hidden;
          position: relative;

          ::ng-deep .p-datatable-table-container {
            overflow: auto;
          }

          ::ng-deep .p-datatable-table {
            margin-inline: auto;
          }

          ::ng-deep .p-datatable-thead > tr > th#first,
          ::ng-deep .p-datatable-tbody > tr > td.first {
            width: 35px !important;
            min-width: 35px !important;
            max-width: 35px !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            box-sizing: border-box;
            background: linear-gradient(90deg, #eee 25%, #fff 50%, #eee 75%);
            background-size: 400% 100%;
            animation: shimmer 2s infinite linear;
          }

          ::ng-deep .p-datatable-thead > tr > th#head,
          ::ng-deep .p-datatable-tbody > tr > td.user-head {
            width: 150px !important;
            min-width: 150px !important;
            max-width: 150px !important;
            border: 1px solid #e2e8f0;
            box-sizing: border-box;
            overflow: hidden;
            background: linear-gradient(90deg, #eee 25%, #fff 50%, #eee 75%);
            background-size: 400% 100%;
            animation: shimmer 2s infinite linear;
          }

          ::ng-deep .p-datatable-tbody > tr > td.user-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 4px;
            white-space: nowrap;
            padding-left: 12px !important;
          }

          ::ng-deep .p-datatable-tbody > tr > td.user-head .user-head-label {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1 1 auto;
            background: linear-gradient(90deg, #eee 25%, #fff 50%, #eee 75%);
            background-size: 400% 100%;
            animation: shimmer 2s infinite linear;
          }

          ::ng-deep .p-datatable-thead > tr > th#first,
          ::ng-deep .p-datatable-tbody > tr > td.first,
          ::ng-deep .p-datatable-thead > tr > th#head,
          ::ng-deep .p-datatable-tbody > tr > td.user-head,
          ::ng-deep .p-datatable-thead > tr > th.day,
          ::ng-deep .p-datatable-tbody > tr > td.day,
          ::ng-deep .p-datatable-thead > tr > th.last,
          ::ng-deep .p-datatable-tbody > tr > td.last {
            box-sizing: border-box;
            height: 35px;
            min-height: 35px;
            max-height: 35px;
            vertical-align: middle;
            padding-top: 0;
            padding-bottom: 0;
            border: 1px solid #e2e8f0 !important;
            background: linear-gradient(90deg, #eee 25%, #fff 50%, #eee 75%);
            background-size: 400% 100%;
            animation: shimmer 2s infinite linear;
          }

          ::ng-deep .p-datatable-thead > tr > th.day,
          ::ng-deep .p-datatable-tbody > tr > td.day {
            width: 35px;
            min-width: 35px;
            max-width: 35px;
          }

          ::ng-deep .p-datatable-thead > tr > th.last,
          ::ng-deep .p-datatable-tbody > tr > td.last {
            width: 35px;
            min-width: 35px;
            max-width: 35px;
          }

          ::ng-deep .p-datatable-thead > tr > th.day {
            line-height: 1;
            font-size: 0.75rem;
            white-space: nowrap;
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
    `,
  ],
})
export class ProposalSkeletonComponent {
  readonly authStore = inject(AuthStore);
  readonly propStore = inject(ProposalStore);
  emptyDays = new Array(31);
  emptyUsers = Array.from({ length: 13 }, (_, index) => ({
    id: index,
  }));

  height = signal<number>(window.innerHeight);
  tableWidth = computed(() => {
    const fixedWidth = 150 + 35 + 35;
    return `${fixedWidth + 31 * 35}px`;
  });

  @HostListener('window:resize')
  onWindowResize() {
    this.height.set(window.innerHeight);
  }

  scrollHeight = computed(() => {
    if (this.propStore.currentCard()?.users) {
      if (this.height() < 700) {
        return '500px';
      } else if (this.height() > 700 && this.height() < 920) {
        if (
          this.propStore.currentCard() &&
          this.propStore.currentCard()!.users.length > 13
        ) {
          return '580px';
        } else {
          return '';
        }
      } else {
        return '';
      }
    } else {
      return '';
    }
  });
}
