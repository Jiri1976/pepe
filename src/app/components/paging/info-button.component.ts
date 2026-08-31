import { Component, computed, inject, input, signal } from '@angular/core';
import { ShiftsStore } from '../../stores/shifts-store/shifts.store';

@Component({
  selector: 'app-info-button',
  standalone: true,
  template: `
    @if (card()) {
      <button class="info-button" [style]="bodyStyles()">
        {{ card()?.userName }}&nbsp;{{ card()?.userSurname?.substring(0, 1) }}.
      </button>
    }
  `,
  styles: [
    `
      .info-button {
        width: 140px;
        height: 35px;
        letter-spacing: 1px;
        border: none;
        background-color: var(--main-dark);
        font-weight: 600;
        transition: 0.3s;
        margin: 5px;
        border-radius: 7px;
        color: var(--white);
      }

      .info-button:hover {
        cursor: default;
      }
    `,
  ],
})
export class InfoButtonComponent {
  readonly shiftsStore = inject(ShiftsStore);
  card = computed(() => this.shiftsStore.currentCard());
  //   destination = input<string>();
  right = input<number>();
  bottom = input<number>();

  bodyStyles = computed(() => {
    if (this.right() && this.bottom()) {
      return {
        position: 'absolute',
        right: `${this.right()}px`,
        bottom: `${this.bottom()}px`,
      };
    } else {
      return {};
    }
  });
}
