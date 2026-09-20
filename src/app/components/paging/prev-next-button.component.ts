import { Component, input } from '@angular/core';

@Component({
  selector: 'app-prev-next-button',
  standalone: true,
  template: `
    <button class="prev-next" [class.disabled]="disabled()">
      <i class="bi" [class]="icon()"></i>
    </button>
  `,
  styles: [
    `
      .prev-next {
        width: 65px;
        height: 30px;
        border: 1px solid var(--main-dark);
        background-color: var(--main-dark);
        font-weight: 900;
        transition: 0.3s;
        margin: 5px;
        border-radius: 7px;
        color: var(--white);
      }

      .prev-next:hover {
        background-color: var(--main-dark);
        box-shadow: none;
        color: var(--white);
      }

      .prev-next.disabled {
        cursor: default;
        background-color: var(--white);
        color: var(--main-dark);
        pointer-events: none;
        border: 1px solid var(--main-border-color);

        .bi {
          color: var(--main-border-color);
        }
      }

      @media screen and (max-width: 690px) {
        .prev-next {
          width: 30px;
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
