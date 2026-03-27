import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-nav-button',
  imports: [CommonModule],
  template: `
    @if (!hidden()) {
      <li [ngClass]="classes()">
        <a>
            @if (!loading()) {
            <i class="bi" [class]="icon()"></i>
            <p>{{ label() }}</p>
            } @else {
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            }
        </a>
      </li>
    }    
  `,
  styles: [`
    :host li {
      margin: 10px 0;
      list-style: none;
      box-shadow: none !important;
      color: var(--white);
      background-color: var(--main-dark);
      border-radius: 52% 48% 33% 67%/38% 45% 55% 62%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      transition:
        border-radius 0.5s ease,
        transform 0.4s ease;
      will-change: transform, border-radius;
    }

    :host li.inactive { background-color: var(--main-disabled); }
       :host li.save { background-color: var(--main-green); }
    :host li.delete { background-color: var(--main-red); }

    :host li.disabled { 
      pointer-events: none;
      background-color: var(--main-disabled);
    }

    :host li:hover {
      cursor: pointer;
      transform: skew(6deg, 0deg) scale(1.05);
    }

    :host a {
      width: 40px;
      height: 40px;
      display: flex;
      flex-direction: column;
      align-items: center !important;
      justify-content: center !important;
      text-decoration: none;
    }

    :host a .bi {
      font-size: 1.5rem;
      margin-top: 2px;
    }

    :host a p {
      margin: 0;
      font-size: 0.8rem;
      font-weight: 600;
    }

    :host a .spinner-border {
      --bs-spinner-width: 1.4rem;
      --bs-spinner-height: 1.4rem;
    }
    `],
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
    [`${this.class()}`]: true
  }));
}
