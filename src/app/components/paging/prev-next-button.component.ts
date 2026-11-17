import { Component, input } from '@angular/core';

@Component({
  selector: 'app-prev-next-button',
  standalone: true,
  template: `
    <button
      type="button"
      class="prev-next"
      [disabled]="disabled()"
      [attr.aria-label]="icon()?.includes('left') ? 'Předchozí' : 'Další'"
    >
      <i class="bi" [class]="icon()"></i>
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }

      .prev-next {
        display: grid;
        width: 42px;
        height: 42px;
        place-items: center;
        margin: 3px;
        border: 1px solid #e7e5e4;
        border-radius: 12px;
        background: #fff;
        color: #57534e;
        font-size: 13px;
        cursor: pointer;
        transition:
          transform 150ms ease,
          border-color 150ms ease,
          background 150ms ease,
          color 150ms ease,
          box-shadow 150ms ease;
      }

      .prev-next:hover:not(:disabled) {
        transform: translateY(-1px);
        border-color: #d6d3d1;
        background: #f5f5f4;
        color: #292524;
        box-shadow: 0 4px 10px rgba(41, 37, 36, 0.08);
      }

      .prev-next:focus-visible {
        outline: 3px solid rgba(249, 115, 22, 0.3);
        outline-offset: 2px;
      }

      .prev-next:disabled {
        cursor: not-allowed;
        background: #f5f5f4;
        color: #c4c0bc;

        .bi {
          color: inherit;
        }
      }

      @media screen and (max-width: 690px) {
        .prev-next {
          width: 38px;
          height: 38px;
          border-radius: 11px;
        }

        .prev-next .bi {
          display: inline-block;
          transform: rotate(90deg);
        }
      }
    `,
  ],
})
export class PrevNextButtonComponent {
  icon = input<string>();
  disabled = input<boolean>(false);
}
