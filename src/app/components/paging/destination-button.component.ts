import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-destination-button',
  standalone: true,
  template: `
    <span class="destination-button" [style]="bodyStyles()">
      {{
        destination() === 'F-M'
          ? 'Frýdek-Místek'
          : destination() === 'OVA'
            ? 'Ostrava'
            : 'Všichni'
      }}
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        z-index: 20;
      }

      .destination-button {
        display: inline-flex;
        min-width: 126px;
        min-height: 40px;
        align-items: center;
        justify-content: center;
        margin: 5px;
        padding: 0 14px;
        border: 1px solid #fed7aa;
        border-radius: 11px;
        background: #fff7ed;
        box-shadow: 0 4px 12px rgba(41, 37, 36, 0.08);
        color: #9a3412;
        font-family: 'Montserrat', sans-serif;
        font-size: 11px;
        font-weight: 650;
        letter-spacing: 0.01em;
        line-height: 1;
        white-space: nowrap;
      }

      @media screen and (max-width: 995px) {
        .destination-button {
          display: none;
        }
      }
    `,
  ],
})
export class DestinationButtonComponent {
  destination = input<string>();
  right = input<number>();
  bottom = input<number>();

  bodyStyles = computed(() => {
    if (this.right() !== undefined && this.bottom() !== undefined) {
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
