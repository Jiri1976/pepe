import { Component, inject, input } from '@angular/core';
import { WarehouseStore } from '../../../stores/warehouse-store/warehouse.store';
import { form, FormField } from '@angular/forms/signals';
import { buildWarehouseItem } from '../../../stores/warehouse-store/warehouse.helpers';
import { WarehouseItem } from '../../../models/warehouses.interface';


@Component({
  selector: 'app-widget-add',
  imports: [FormField],
  template: `
            <div class="container d-flex flex-row align-items-center justify-content-between position-relative">
              @if (!store.isSaving()) {
              <form novalidate class="d-flex align-items-center justify-content-center">
                  <div>
                      <input type="text" class="form-control" [formField]="form.name" (blur)="form.name().markAsTouched()"
                          (keydown.enter)="onSave($event)">
                      @if (form.name().invalid() && form.name().dirty()) {
                      <div class="error position-absolute">
                          @for (error of form.name().errors(); track error.kind) {
                          <p>{{ error.message }}</p>
                          }
                      </div>
                      }
                  </div>
              </form>
              <button class="save-button d-flex flex-column justify-content-center align-items-center me-1" (click)="onSave()"
                  [class.disabled]="form().invalid()" [disabled]="form().invalid()"><i class="bi bi-check-lg"></i></button>
              <button class="delete-button d-flex flex-column justify-content-center align-items-center ms-1"
                  (click)="onDelete()"><i class="bi bi-trash"></i></button>
              } @else {
              <div class="spinner w-100 d-flex flex-row justify-content-center align-items-center">
                  <div class="spinner-border text-secondary" role="status">
                      <span class="visually-hidden">Loading...</span>
                  </div>
              </div>
              }
            </div>
  `,
  styles: [`
          :host {
            position: absolute;
            z-index: 2;
            background: var(--white);
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            box-sizing: border-box;

            .container {
                width: 400px;
                padding: 10px 20px;
                overflow: hidden;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

                p {
                    margin: 0;
                }

                .save-button,
                .delete-button {
                    border: none;
                    background: var(--white);
                    border-radius: 50%;
                    height: 28px;
                    width: 28px;
                    outline: 5px solid var(--white);
                    transition: all .3s ease-in-out;
                }

                .save-button {
                    margin-left: 35px;
                    color: var(--main-green);
                }

                .save-button:hover {
                    background: var(--main-green);
                    color: var(--white);
                    cursor: pointer;
                }

                .save-button.disabled:hover {
                    background: var(--main-green);
                    color: var(--white);
                    opacity: 0.5;
                }

                .delete-button {
                    color: var(--main-red);
                }

                .delete-button:hover {
                    background: var(--main-red);
                    color: var(--white);
                }

                input {
                    padding: 4px 0px;
                    width: 270px;
                    border: none !important;
                    outline: none;
                    color: var(--main-dark);
                    font-weight: 500;
                }

                input:active,
                input:focus {
                    border-top: 0;
                    border-left: 0;
                    border-right: 0;
                    border-bottom: 2px solid var(--main-dark);
                    outline: none !important;
                    box-shadow: none !important;
                }

                input:-webkit-autofill,
                input:-webkit-autofill:hover,
                input:-webkit-autofill:focus,
                input:-webkit-autofill:active {
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: var(--main-dark);
                    transition: background-color 5000s ease-in-out 0s;
                    box-shadow: inset 0 0 20px 20px transparent;
                }

                .error {
                    font-size: 0.7rem;
                    bottom: -4px;

                    p {
                        color: var(--main-red);
                        font-weight: 600;
                    }
                }

                .spinner {

                    .spinner-border {
                        --bs-spinner-width: 1.5rem;
                        --bs-spinner-height: 1.5rem;
                    }

                    .text-secondary {
                        --bs-text-opacity: 1;
                        color: var(--main-dark) !important;
                    }
                }
            }
          }
    `]
})
export class WidgetAddComponent {
  readonly store = inject(WarehouseStore);
  item = input.required<WarehouseItem>();

  readonly form = form(this.store.warehouseItemModel, s => {
    buildWarehouseItem(s);
  });

  ngOnInit() {
    this.form.name().value.set('');
  }

  ngAfterViewInit() {
    this.form.name().focusBoundControl();
  }

  onSave(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.form.name().value() === '') {
      return;
    }
    const newItem: WarehouseItem = {
      id: 0,
      name: this.form.name().value(),
      position: 1
    }
    this.store.createWarehouseItem(newItem);
  }

  onDelete() {
    this.store.removeWarehouseItem(this.item());
  }
}
