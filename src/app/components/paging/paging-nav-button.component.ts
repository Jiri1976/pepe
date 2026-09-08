import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-nav-button',
  standalone: true,
  template: `
    <button [class.active]="active()" class="page-nav-button">
      <ng-content />
    </button>
  `,
  styles: [
    `
      button {
        border-radius: 7px;
        box-shadow: inset 0 0 1px 1px var(--main-border-color);
        width: 38px;
        height: 38px;
        border: 1px solid var(--main-border-color);
        background-color: var(--white);
        font-weight: 400;
        margin: 0 3px;
      }

      button:hover {
        background-color: var(--main-dark);
        box-shadow: none;
        color: var(--white);
      }

      button.active {
        width: 35px;
        height: 35px;
        border: 1px solid var(--main-border-color);
        font-weight: 400;
        transition: 0.3s;
        background-color: var(--main-dark);
        color: var(--white);
        box-shadow: none;
      }
    `,
  ],
})
export class PagingNavButtonComponent {
  active = input<boolean>(false);
}
