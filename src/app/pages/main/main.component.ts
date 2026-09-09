import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthStore } from '../../stores/auth-store/auth.store';
import { ProposalStore } from '../../stores/proposal-store/proposal.store';
import { ShiftsStore } from '../../stores/shifts-store/shifts.store';
import { WarehouseStore } from '../../stores/warehouse-store/warehouse.store';
import { Navigation } from './main-navigation';

@Component({
  selector: 'app-main',
  imports: [RouterLink, RouterOutlet],
  template: `
    <div
      class="container text-center d-flex flex-column justify-content-center align-items-center"
    >
      <div
        class="row d-flex flex-row justify-content-center align-items-center"
      >
        @for (nav of navigation; track $index) {
          <div class="col" [class.hidden]="hideFrom(nav.hideFrom)">
            <div
              class="category position-relative d-flex justify-content-center align-items-center"
              [routerLink]="nav.link"
            >
              <img class="position-absolute" [src]="nav.image" />
              <div class="overlay position-absolute"></div>
              <div class="category_text text-white position-relative">
                <div class="category_text_icon">
                  <i [class]="getIconClass(nav.icon)"></i>
                </div>
                <p class="fw-bold">{{ nav.title }}</p>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
    <router-outlet />
  `,
  styles: [
    `
      .container {
        height: 100vh;

        .row {
          .hidden {
            display: none;
          }

          .category {
            width: 230px;
            height: 180px;
            cursor: pointer;
            margin: 10px 0;
            border-radius: 5px;
            transform: translateY(0);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
            transition:
              transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 260ms ease;
            will-change: transform, box-shadow;

            img {
              width: 230px;
              height: 180px;
              border-radius: 5px;
            }

            .overlay {
              width: 100%;
              height: 100%;
              background-color: rgba(0, 0, 0, 0.45);
              transform: scale(1);
              transform-origin: center;
              transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
              will-change: transform;
              border-radius: 7px;
            }

            .category_text {
              .category_text_icon {
                i {
                  font-size: 3rem;
                  transform: scale(1);
                  transform-origin: center;
                  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
                  will-change: transform;
                }
              }

              p {
                font-size: 1.5rem;
                transform: scale(1);
                transform-origin: center;
                transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
                will-change: transform;
              }
            }

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 18px rgba(0, 0, 0, 0.14);

              .overlay {
                transform: scale(0.8);
              }

              .category_text {
                .category_text_icon {
                  i {
                    transform: scale(1.08);
                  }
                }

                p {
                  transform: scale(1.08);
                }
              }
            }
          }
        }
      }

      @media screen and (max-width: 1200px) {
        .container {
          .row {
            .col {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
          }
        }
      }

      @media screen and (max-width: 599px) {
        .container {
          height: 100%;
        }

        .container .row {
          flex-direction: column !important;
          margin-top: 100px;
        }

        .container .row .category {
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
        }

        .container .row .category:hover {
          box-shadow: 0 5px 12px rgba(0, 0, 0, 0.1);
        }
      }

      @media (orientation: landscape) and (max-width: 690px) {
        .container {
          margin-top: 70px;
          height: 100%;
        }
      }
    `,
  ],
})
export default class MainComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly propStore = inject(ProposalStore);
  readonly shiftsStore = inject(ShiftsStore);
  readonly warehouseStore = inject(WarehouseStore);
  readonly navigation = Navigation;

  ngOnInit(): void {
    if (this.authStore.user()?.role === 'Admin') {
      this.propStore.setDestination('F-M');
      this.shiftsStore.setDestination('F-M');
      this.warehouseStore.setDestination('F-M');
    } else {
      this.propStore.setDestination(this.authStore.user()!.destination);
      this.shiftsStore.setDestination(this.authStore.user()!.destination);
      this.warehouseStore.setDestination(this.authStore.user()!.destination);
    }
    this.propStore.resetCalendar();
  }

  hideFrom(role: string) {
    return this.authStore.user()?.role === role;
  }

  getIconClass(icon: string) {
    return `bi ${icon}`;
  }
}
