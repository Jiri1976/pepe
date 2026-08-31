import { Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'app-destination-button',
  standalone: true,
  template: `
    <button class="destination-button" [style]="bodyStyles()">
      {{
        destination() === 'F-M'
          ? 'Frýdek-Místek'
          : destination() === 'OVA'
            ? 'Ostrava'
            : 'Všichni'
      }}
    </button>
  `,
  styles: [
    `
      .destination-button {
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

      .destination-button:hover {
        cursor: default;
      }
    `,
  ],
})
export class DestinationButtonComponent {
  destination = input<string>();
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
