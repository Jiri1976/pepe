import { Component } from '@angular/core';

@Component({
  selector: 'app-paging',
  standalone: true,
  template: `
    <div>
      <ng-content />
    </div>
  `,
  styles: [
    `
      :host {
        position: fixed;
        right: 10px;
        bottom: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      :host ::ng-deep .info-button:active {
        transform: scale(0.7);
      }
    `,
  ],
})
export class PagingComponent {}
