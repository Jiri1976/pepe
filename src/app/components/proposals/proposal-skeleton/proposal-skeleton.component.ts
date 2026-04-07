import { Component } from '@angular/core';

@Component({
  selector: 'app-proposal-skeleton',
  template: `
        <div class="skeleton d-flex flex-column align-items-center justify-content-center position-relative">
          <div class="table d-flex flex-column">
              <div class="table-head d-flex flex-row">
                  <div class="user-name"></div>
                  @for(shift of emptyDays; track $index) {
                  <th>
                      <div class="cell"></div>
                  </th>
                  }
              </div>
              <div class="body">
                  @for(user of emptyUsers; track $index) {
                  <div class="table-row d-flex flex-row">
                      <div class="user-name"></div>
                      @for(shift of emptyDays; track $index) {
                      <div class="cell"></div>
                      }
                  </div>
                  }
              </div>
          </div>
        </div>
  `,
  styles: [
    `
      .skeleton {
        grid-column: 1;
        grid-row: 1;
        width: 100%;

        .table {
            margin-top: 90px;

            .table-head {
                margin-bottom: 10px;
            }

            .body {
                .table-row {
                    margin: 5px 0;

                    .cell {
                        margin-right: 2px;
                    }
                }
            }
        }
      }

      .user-name {
          min-width: 150px !important;
          margin-right: 10px;
          border: 1px solid var(--main-disabled);
          background: linear-gradient(90deg,
                  #eee 25%,
                  #fff 50%,
                  #eee 75%);
          background-size: 400% 100%;
          border-radius: 7px;
          animation: shimmer 2s infinite linear;
      }

      .cell {
          border: 1px solid var(--main-disabled);
          background: linear-gradient(90deg,
                  #eee 25%,
                  #fff 50%,
                  #eee 75%);
          background-size: 400% 100%;
          animation: shimmer 2s infinite linear;
          width: 35px !important;
          height: 35px !important;
          border-radius: 7px;
      }

      @keyframes shimmer {
          0% {
              background-position: -200% 0;
          }

          100% {
              background-position: 200% 0;
          }
      }
    `
  ]
})
export class ProposalSkeletonComponent {
  emptyDays = new Array(31);
  emptyUsers = new Array(13);
}
