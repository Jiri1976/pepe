import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-nav-button',
  imports: [CommonModule],
  host: {
    '[style.display]': 'hidden() ? "none" : null',
  },
  template: `
    @if (!hidden()) {
      <li [ngClass]="classes()">
        <button
          type="button"
          [disabled]="disabled()"
          [attr.aria-label]="label() || icon() || 'Akce'"
          [attr.title]="label() || null"
        >
          @if (!loading()) {
            <i class="bi" [class]="icon()"></i>
            <p>{{ label() }}</p>
          } @else {
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          }
        </button>
      </li>
    }
  `,
  styles: [
    `
      :host li {
        margin: 7px 0;
        list-style: none;
        background: transparent;
      }

      :host li > button {
        display: flex;
        width: 48px;
        height: 48px;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1px;
        padding: 3px;
        border: 1px solid #e7e5e4;
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.96);
        box-shadow: 0 4px 12px rgba(41, 37, 36, 0.1);
        color: #57534e;
        cursor: pointer;
        transition:
          transform 150ms ease,
          border-color 150ms ease,
          background 150ms ease,
          color 150ms ease,
          box-shadow 150ms ease;
      }

      :host li.inactive > button {
        border-color: #e8e5e1;
        background: #f5f5f4;
        color: #a8a29e;
        box-shadow: none;
      }

      :host li.save {
        --nav-accent: #15803d;
      }

      :host li.delete {
        --nav-accent: #be123c;
      }

      :host li.save > button,
      :host li.delete > button {
        border-color: color-mix(in srgb, var(--nav-accent) 20%, white);
        color: var(--nav-accent);
      }

      :host li > button:hover:not(:disabled) {
        transform: translateY(-2px);
        border-color: #d6d3d1;
        background: #fff;
        box-shadow: 0 7px 16px rgba(41, 37, 36, 0.15);
        color: #292524;
      }

      :host li.save > button:hover:not(:disabled),
      :host li.delete > button:hover:not(:disabled) {
        border-color: var(--nav-accent);
        background: var(--nav-accent);
        color: #fff;
      }

      :host li > button:focus-visible {
        outline: 3px solid rgba(249, 115, 22, 0.3);
        outline-offset: 2px;
      }

      :host li > button:disabled {
        border-color: #e7e5e4;
        background: #f5f5f4;
        box-shadow: none;
        color: #c4c0bc;
        cursor: not-allowed;
      }

      :host li > button .bi {
        font-size: 1.2rem;
        line-height: 1;
      }

      :host li > button p {
        margin: 0;
        font-size: 9px;
        font-weight: 650;
        line-height: 1.1;
      }

      :host li > button .spinner-border {
        --bs-spinner-width: 1.2rem;
        --bs-spinner-height: 1.2rem;
      }

      @media screen and (max-width: 690px) {
        :host li {
          margin: 5px 0;
        }

        :host li > button {
          width: 42px;
          height: 42px;
          border-radius: 13px;
        }

        :host li > button .bi {
          font-size: 1.1rem;
        }

        :host li > button p {
          font-size: 8px;
        }
      }

      @media screen and (min-height: 360px) {
        :host#last-one {
          position: absolute;
          bottom: 0px;
          left: 10px;
        }
      }
    `,
  ],
})
export class NavButtonComponent {
  inactive = input(false);
  disabled = input(false);
  loading = input(false);
  icon = input<string>();
  label = input<string>();
  hidden = input(false);
  class = input<'default' | 'delete' | 'save'>('default');

  classes = computed(() => ({
    inactive: this.inactive(),
    disabled: this.disabled(),
    [`${this.class()}`]: true,
  }));
}
