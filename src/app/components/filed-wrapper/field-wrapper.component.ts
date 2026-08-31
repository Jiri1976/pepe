import { Component, computed, contentChild, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-field',
  standalone: true,
  template: `
    <div class="field">
      <div class="field-wrapper" [class.errorField]="touched() && invalid()">
        @if (label()) {
          <label>{{ label() }}</label>
        }
        <ng-content />
      </div>

      @if (displayErrors() && touched()) {
        <div class="error-container">
          @for (err of errors(); track err.kind) {
            <div class="error">{{ err.message }}</div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .field {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .field-wrapper {
        display: flex;
        align-items: center;
        border: 1px solid rgba(0, 0, 0, 0.2);
        border-radius: 35px;
        padding: 0 10px;
        height: 42px;
      }

      .field-wrapper.errorField {
        border: 1px solid var(--main-red);
      }

      :host ::ng-deep .bi {
        font-size: 1.2rem;
        color: rgba(0, 0, 0, 0.4);
        margin-right: 8px;
      }

      :host ::ng-deep .field-wrapper.errorField .bi {
        color: var(--main-red);
      }

      :host ::ng-deep input {
        flex: 1;
        height: 100%;
        border: none;
        outline: none;
        background: transparent;
        color: var(--main-dark);
        font-weight: 500;
        min-width: 0;
      }

      :host ::ng-deep input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      textarea:-webkit-autofill,
      textarea:-webkit-autofill:hover,
      textarea:-webkit-autofill:focus,
      select:-webkit-autofill,
      select:-webkit-autofill:hover,
      select:-webkit-autofill:focus {
        border: none;
        -webkit-text-fill-color: var(--main-dark);
        -webkit-box-shadow: 0 0 0px 1000px transparent inset;
        transition: background-color 5000s ease-in-out 0s;
      }

      :host ::ng-deep input.touched.invalid {
        color: var(--main-red);
      }

      :host ::ng-deep .counter {
        position: absolute;
        right: 10px;
        bottom: -14px;
        font-size: 0.65rem;
        color: var(--main-disabled);
      }

      :host ::ng-deep .counter.counterError {
        color: var(--main-red);
      }

      :host ::ng-deep input::placeholder {
        color: var(--main-dark);
        letter-spacing: 1px;
      }

      :host ::ng-deep input.touched.invalid::placeholder {
        color: var(--main-red);
      }

      .error-container {
        position: absolute;
        top: 100%;
        left: 10px;
        margin-top: 2px;
        pointer-events: none;
      }

      .error {
        color: var(--main-red);
        font-size: 0.75rem;
        font-weight: 500;
      }
    `,
  ],
})
export class FieldWrapperComponent {
  readonly label = input('');
  readonly fieldDirective = contentChild.required(FormField<any>);
  readonly fieldState = computed(() => this.fieldDirective().state());
  readonly touched = computed(() => this.fieldState().touched());
  readonly errors = computed(() => this.fieldState().errors());
  readonly invalid = computed(() => this.fieldState().invalid());
  readonly displayErrors = input(true);
}
