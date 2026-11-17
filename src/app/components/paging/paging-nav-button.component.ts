import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-nav-button',
  standalone: true,
  template: `
    <button
      type="button"
      [class.active]="active()"
      class="page-nav-button"
      [attr.aria-current]="active() ? 'page' : null"
    >
      <ng-content />
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }

      .page-nav-button {
        display: grid;
        width: 40px;
        height: 40px;
        place-items: center;
        margin: 0 3px;
        border: 1px solid #e7e5e4;
        border-radius: 12px;
        background: #fff;
        color: #57534e;
        font-family: "Montserrat", sans-serif;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition:
          transform 150ms ease,
          border-color 150ms ease,
          background 150ms ease,
          color 150ms ease,
          box-shadow 150ms ease;
      }

      .page-nav-button:hover:not(.active) {
        transform: translateY(-1px);
        border-color: #d6d3d1;
        background: #f5f5f4;
        color: #292524;
        box-shadow: 0 4px 10px rgba(41, 37, 36, 0.08);
      }

      .page-nav-button.active {
        border-color: #292524;
        background: #292524;
        color: #fff;
        box-shadow: 0 3px 8px rgba(41, 37, 36, 0.18);
      }

      .page-nav-button:focus-visible {
        outline: 3px solid rgba(249, 115, 22, 0.3);
        outline-offset: 2px;
      }

      @media screen and (max-width: 995px) {
        .page-nav-button {
          display: none;
        }
      }
    `,
  ],
})
export class PagingNavButtonComponent {
  active = input<boolean>(false);
}
