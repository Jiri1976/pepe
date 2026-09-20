import { Component } from '@angular/core';

@Component({
  selector: 'app-paging',
  standalone: true,
  template: `
    <div class="paging-container">
      <ng-content />
    </div>
  `,
  styles: [
    `
      :host {
        position: fixed;
        right: 10px;
        bottom: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      :host ::ng-deep .info-button:active,
      :host ::ng-deep .prev-next:active {
        transform: scale(0.7);
      }

      @media screen and (max-width: 690px) {
        :host {
          bottom: 10px;
        }

        .paging-container {
          display: flex;
          flex-direction: column;
        }
      }
    `,
  ],
})
export class PagingComponent {}
