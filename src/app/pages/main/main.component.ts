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
    <div class="container text-center d-flex flex-column justify-content-center align-items-center">
        <div class="row d-flex flex-row justify-content-center align-items-center">
            @for(nav of navigation; track $index) {
            <div class="col" [class.hidden]="hideFrom(nav.hideFrom)">
                <div class="category position-relative d-flex justify-content-center align-items-center"
                    [routerLink]="nav.link">
                    <img class="position-absolute" [src]="nav.image" />
                    <div class="overlay position-absolute"></div>
                    <div class="category_text text-white position-relative">
                        <div class="category_text_icon"><i [class]="getIconClass(nav.icon)"></i>
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
  styles: [`
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

            img {
                width: 230px;
                height: 180px;
                border-radius: 5px;
            }

            .overlay {
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.45);
                transition: 0.3s ease-in-out;
                border-radius: 7px;
            }

            .category_text {

                .category_text_icon {
                    i {
                        font-size: 3rem;
                    }
                }

                p {
                    font-size: 1.5rem;
                }
            }

            &:hover {
                .overlay {
                    width: 80%;
                    height: 80%;
                }
            }
          }
        }
      }

      @media screen and (max-width: 599px) {
          .container {
              margin-top: 100px;
          }

          .container .row {
              flex-direction: column !important;
              margin-top: 100px;
          }    
      }
  `]
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
    return `bi ${icon}`
  }
}