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

@Component({
  selector: 'app-proposal-skeleton',
  imports: [TableModule],
  template: `
    <div class="wrapper">
      <div class="p-table-wrapper" [class.height-unlimited]="!scrollHeight()">
        <p-table
          class="proposal-table"
          [value]="emptyUsers"
          [scrollable]="true"
          [scrollHeight]="scrollHeight()"
          [tableStyle]="{ width: tableWidth(), 'table-layout': 'fixed' }"
        >
          <ng-template #header>
            <tr>
              @if (hasReorderColumn()) {
                <th pFrozenColumn id="first"></th>
              }

              <th pFrozenColumn id="head"></th>
              @for (day of emptyDays(); track $index) {
                <th class="day" [class.is-weekend]="day.isWeekend"></th>
              }

              @if (isEditable()) {
                <th class="last"></th>
              }
            </tr>
          </ng-template>
          <ng-template #body>
            <tr>
              @if (hasReorderColumn()) {
                <td pFrozenColumn class="first"><span class="skeleton-bar handle"></span></td>
              }
              <td pFrozenColumn class="user-head"></td>

              @for (day of emptyDays(); track $index) {
                <td class="day" [class.is-weekend]="day.isWeekend"></td>
              }

              @if (isEditable()) {
                <td class="last"><span class="skeleton-bar remove"></span></td>
              }
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
        display: flex;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
        padding-inline: 70px;
        margin-top: 90px;
        overflow-x: hidden;
        flex-direction: column;
        align-items: stretch;
        justify-content: center;
      }

      .p-table-wrapper {
        position: relative;
        width: 100%;
        min-width: 0;
        max-width: 100%;
        margin: 0 auto;
        overflow: hidden;
        border: 1px solid #e8e5e4;
        border-radius: 15px;
        background: #fff;
        box-shadow: 0 8px 26px rgba(41, 37, 36, 0.07);

        ::ng-deep .p-datatable {
          color: #292524;
          font-family: "Montserrat", sans-serif;
          font-size: 11px;
        }

        ::ng-deep .p-datatable-table-container {
          overflow: auto;
          overscroll-behavior: contain;
          scrollbar-color: #c4c0bc #f5f5f4;
          scrollbar-width: thin;
          -webkit-overflow-scrolling: touch;
        }

        &.height-unlimited ::ng-deep .p-datatable-table-container {
          overflow-y: hidden !important;
        }

        ::ng-deep .p-datatable-table {
          margin-inline: auto;
          border-collapse: separate;
          border-spacing: 0;
        }

        ::ng-deep .p-datatable-thead > tr > th {
          border-color: #e7e5e4;
          background: #f7f6f5;
        }

        ::ng-deep .p-datatable-tbody > tr > td {
          border-color: #eeecea;
          background: #fff;
        }

        ::ng-deep .p-datatable-tbody > tr:nth-child(even) > td:not(.is-weekend) {
          background: #fcfbfa;
        }

        ::ng-deep .p-datatable-thead > tr > th#first,
        ::ng-deep .p-datatable-tbody > tr > td.first {
          width: 35px !important;
          min-width: 35px !important;
          max-width: 35px !important;
          padding: 0 !important;
          text-align: center;
        }

        ::ng-deep .p-datatable-thead > tr > th#head,
        ::ng-deep .p-datatable-tbody > tr > td.user-head {
          width: 150px !important;
          min-width: 150px !important;
          max-width: 150px !important;
          box-sizing: border-box;
        }

        ::ng-deep .p-datatable-thead > tr > th#head {
          background: #f7f6f5;
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
          height: 38px;
          min-height: 38px;
          max-height: 38px;
          padding-top: 0;
          padding-bottom: 0;
          border-color: #eeecea;
          vertical-align: middle;
        }

        ::ng-deep .p-datatable-thead > tr > th.day,
        ::ng-deep .p-datatable-tbody > tr > td.day,
        ::ng-deep .p-datatable-thead > tr > th.last,
        ::ng-deep .p-datatable-tbody > tr > td.last {
          width: 35px;
          min-width: 35px;
          max-width: 35px;
          padding-right: 0;
          padding-left: 0;
        }

        ::ng-deep .p-datatable-thead > tr > th.day {
          line-height: 1.15;
          font-size: 9px;
        }

        ::ng-deep .p-datatable-thead > tr > th.day.is-weekend,
        ::ng-deep .p-datatable-tbody > tr > td.day.is-weekend {
          background: #fff1e8 !important;
        }

        ::ng-deep .p-datatable-thead > tr > th:not(#first):not(#head):not(.day):not(.last),
        ::ng-deep .p-datatable-tbody > tr > td:not(.first):not(.user-head):not(.day):not(.last) {
          height: 38px;
        }

        ::ng-deep .p-datatable-thead > tr > th.day,
        ::ng-deep .p-datatable-tbody > tr > td.day {
          background-image: linear-gradient(90deg, #eee 25%, #fff 50%, #eee 75%);
          background-size: 400% 100%;
          animation: shimmer 2s infinite linear;
        }

        ::ng-deep .p-datatable-thead > tr > th.day.is-weekend,
        ::ng-deep .p-datatable-tbody > tr > td.day.is-weekend {
          background-image: linear-gradient(90deg, #ffefe5 25%, #fff7f2 50%, #ffefe5 75%) !important;
        }

        .skeleton-bar {
          display: inline-block;
          border-radius: 6px;
          background: linear-gradient(90deg, #eee 25%, #fff 50%, #eee 75%);
          background-size: 400% 100%;
          animation: shimmer 2s infinite linear;
        }

        .skeleton-bar.handle {
          width: 14px;
          height: 14px;
        }

        .skeleton-bar.remove {
          width: 25px;
          height: 25px;
          border-radius: 8px;
        }
      }

      @media screen and (max-width: 690px) {
        .wrapper {
          margin-top: 78px;
          padding-left: 12px;
          padding-right: 12px;
        }

        .p-table-wrapper {
          border-radius: 12px;
          overflow-x: auto;
          overflow-y: hidden;

          ::ng-deep .p-datatable-table-container {
            width: 100%;
            min-width: 0;
            max-width: 100%;
            max-height: calc(100dvh - 190px);
            overflow-x: scroll !important;
            overflow-y: auto !important;
            overscroll-behavior: contain;
            touch-action: pan-x pan-y;
            -webkit-overflow-scrolling: touch;
          }

          ::ng-deep .p-datatable-thead > tr > th#head,
          ::ng-deep .p-datatable-tbody > tr > td.user-head {
            width: 132px !important;
            min-width: 132px !important;
            max-width: 132px !important;
          }

          ::ng-deep .p-datatable-thead > tr > th,
          ::ng-deep .p-datatable-tbody > tr > td {
            height: 36px;
            min-height: 36px;
            max-height: 36px;
          }

          ::ng-deep .p-datatable-thead > tr > th.day {
            font-size: 8px;
          }
        }
      }

      @media screen and (max-width: 690px) and (max-height: 420px) {
        .p-table-wrapper ::ng-deep .p-datatable-table-container {
          max-height: calc(100dvh - 130px);
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
  readonly isEditable = computed(() => !this.propStore.isPassedCard());
  readonly hasReorderColumn = computed(
    () =>
      this.isEditable() &&
      this.authStore.user()?.role === 'Admin' &&
      (this.propStore.currentCard()?.users?.length ?? 0) > 1,
  );

  readonly emptyDays = computed(() => {
    const shifts = this.propStore.currentCard()?.users?.[0]?.shifts ?? [];
    const dayCount =
      shifts.length || this.propStore.currentCard()?.countOfDays || 31;

    return Array.from({ length: dayCount }, (_, index) => ({
      isWeekend: shifts[index]
        ? this.isWeekend(shifts[index].proposalDate)
        : false,
    }));
  });

  emptyUsers = Array.from({ length: 13 }, (_, index) => ({
    id: index,
  }));

  height = signal<number>(window.innerHeight);
  tableWidth = computed(() => {
    const fixedWidth = 150 + (this.hasReorderColumn() ? 35 : 0) + (this.isEditable() ? 35 : 0);
    return `${fixedWidth + this.emptyDays().length * 35}px`;
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

  private isWeekend(date: string): boolean {
    const [day, month, year] = date.split('.').map(Number);
    const weekday = new Date(year, month - 1, day).getDay();
    return weekday === 0 || weekday === 5 || weekday === 6;
  }
}
