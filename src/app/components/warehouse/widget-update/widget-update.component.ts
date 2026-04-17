import { Component, inject, input, model, signal } from '@angular/core';
import { WarehouseStore } from '../../../stores/warehouse-store/warehouse.store';
import { WarehouseItemForm } from '../../../stores/warehouse-store/warehouse.helpers';
import { form, FormField, required, validate } from '@angular/forms/signals';
import { WarehouseItem } from '../../../models/warehouses.interface';

@Component({
    selector: 'app-widget-update',
    imports: [FormField],
    template: `
        <div class="container d-flex flex-row align-items-center justify-content-between position-relative">
          @if (!store.isSaving()) {
          <form novalidate class="d-flex flex-column w-100 justify-content-center">
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
          <button class="save-button d-flex flex-column justify-content-center align-items-center" (click)="onSave()"
              [class.disabled]="form().invalid()" [disabled]="form().invalid()"><i class="bi bi-check-lg"></i></button>
          <button class="close-button d-flex flex-column justify-content-center align-items-center" (click)="onClose()"><i
                  class="bi bi-x-lg"></i></button>
          } @else {
          <div class="spinner d-flex flex-row align-items-center justify-content-center w-100">
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

                .close-button,
                .save-button {
                    border: none;
                    background: var(--white);
                    border-radius: 50%;
                    height: 28px;
                    width: 28px;
                    transition: all .3s ease-in-out;
                }

                .close-button {
                    color: var(--main-dark);
                }

                .close-button:hover {
                    background: var(--main-dark);
                    ;
                    color: var(--white);
                }

                .save-button {
                    color: var(--main-green);
                }

                .save-button:hover {
                    background: var(--main-green);
                    color: var(--white);
                }

                .save-button.disabled:hover {
                    background: var(--main-green);
                    color: var(--white);
                    opacity: 0.5;
                }

                input {
                    padding: 6px 0px;
                    width: 270px;
                    border: none !important;
                    outline: none;
                    color: var(--main-dark);
                    border-radius: 0;
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
export class WidgetUpdateComponent {
    readonly store = inject(WarehouseStore);
    item = input.required<WarehouseItem>();
    updateVisible = model<boolean>(false);
    warehouseItemModel = signal<WarehouseItemForm>({
        name: ''
    });

    readonly form = form(this.store.warehouseItemModel, s => {
        required(s.name, { message: 'Název položky je povinný' });
        validate(s.name, field =>
            (field.value()?.length ?? 0) > 30
                ? { kind: 'maxLength', message: 'Prosím pouze 30 znaků' }
                : null
        );
    });

    ngOnInit() {
        this.form.name().value.set(this.item().name);
    }

    ngAfterViewInit() {
        this.form.name().focusBoundControl();
    }

    onClose() {
        this.updateVisible.set(false);
    }

    onSave(event?: Event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (this.form.name().invalid()) {
            return;
        }

        if (this.form.name().value() === this.item().name) {
            this.updateVisible.set(false);
            return;
        }

        const newItem: WarehouseItem = {
            id: this.item().id,
            name: this.form.name().value(),
            position: this.item().position
        }
        this.store.updateWarehouseItem(newItem, this.item().name);
        this.updateVisible.set(false);
    }
}