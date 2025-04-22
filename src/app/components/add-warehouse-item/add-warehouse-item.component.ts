import { Component, computed, DestroyRef, effect, inject, OnInit, output } from '@angular/core';
import { WarehouseItem } from '../../models/warehouse/warehouse-item.interface';
import { AlertService } from '../../services/alert.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WarehouseService } from '../../services/warehouse.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ErrorHandlingService } from '../../services/error-handling.service';
import { concatMap, of, tap } from 'rxjs';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-add-warehouse-item',
  standalone: true,
  imports: [ReactiveFormsModule, DragDropModule, CommonModule],
  templateUrl: './add-warehouse-item.component.html',
  styleUrl: './add-warehouse-item.component.scss',
  animations: []
})
export class AddWarehouseItemComponent implements OnInit {
  private warehouseService = inject(WarehouseService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  private errorHandlingService = inject(ErrorHandlingService);
  private confirmService = inject(ConfirmService);

  items = computed(() => this.warehouseService.items());
  title = 'Seznam skladových položek';
  initialItem: WarehouseItem = { id: 0, name: '', shortName: '', position: 0 };
  selectedItem = this.initialItem;
  editingEnabled = false;
  backSelected = output<boolean>();
  itemForm!: FormGroup;
  isLoading = false;
  nothingChanged = true;
  changingPositions = false;

  constructor() {
    effect(() => { });
  }

  ngOnInit(): void {
    this.initializedItemForm();
  }

  addItem() {
    this.itemForm.reset();
    this.changingPositions = false;
    this.editingEnabled = true;
    this.selectedItem = this.initialItem;
    this.patchForm();
    this.title = 'Přidat skladovou položku';
  }

  onSelectBack() {
    this.changingPositions = false;
    this.backSelected.emit(false);
    this.nothingChanged = true;
    this.selectedItem = this.initialItem;
    this.selectedItem.id = 0;
    this.patchForm();
  }

  onBack() {
    this.changingPositions = false;
    this.title = 'Seznam skladových položek';
    this.nothingChanged = true;
    this.editingEnabled = false;
    this.selectedItem = this.initialItem;
    this.selectedItem.id = 0;
    this.patchForm();
  }

  onSelectUpdate(index: number) {
    this.changingPositions = false;
    this.title = 'Upravit skladovou položku';
    this.selectedItem = this.items()![index];
    this.patchForm();
    this.editingEnabled = true;
  }

  drop(event: CdkDragDrop<string[]>) {
    this.changingPositions = true;
    this.isLoading = true;
    moveItemInArray(this.items(), event.previousIndex, event.currentIndex);
    this.changePosition();
  }

  onSumbit() {
    if (this.itemForm.invalid) {
      return;
    }

    if (this.selectedItem.id === 0) {
      this.confirmService.confirm('Opravdu přidat skladovou položku?')
        .then((confirmed) => {
          if (confirmed) {
            this.isLoading = true;
            const data = {
              id: this.selectedItem.id,
              name: this.itemForm.value.name,
              shortName: this.itemForm.value.shortName,
              position: this.selectedItem.position
            };

            const subscription = this.warehouseService.createWarehouseItem(data).pipe(
              tap(response => {
                this.isLoading = false;
                if (response === null) {
                  this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
                } else if (response.isSuccess === false) {
                  this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
                } else {
                  let _items = this.items() && this.items().length > 0 ? [...this.items()] : [];
                  data.id = response.result.id;
                  data.position = response.result.position;
                  _items.push(data);
                  this.nothingChanged = true;
                  this.warehouseService.setItems(_items);
                  this.selectedItem.id = response.result.id;
                  this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: 'Položka byla úspěšně vytvořena.' });
                }
              })
            ).subscribe({
              next: () => { },
              error: error => this.handleError(error)
            });

            this.destroyRef.onDestroy(() => {
              subscription.unsubscribe();
            });
          }
        });
    } else {
      this.confirmService.confirm('Opravdu upravit skladovou položku?')
        .then((confirmed) => {
          if (confirmed) {
            this.isLoading = true;
            const data = {
              id: this.selectedItem.id,
              name: this.itemForm.value.name,
              shortName: this.itemForm.value.shortName,
              position: this.selectedItem.position
            };
            const subscription = this.warehouseService.updateWarehouseItem(data).pipe(
              tap(response => {
                this.isLoading = false;
                if (response === null) {
                  this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
                } else if (response.isSuccess === false) {
                  this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
                } else {
                  const _items = [...this.items()];
                  let _item = _items.find(x => x.id === data.id);
                  const index = _items.indexOf(_item!);
                  _items[index].name = data.name;
                  _items[index].shortName = data.shortName;
                  _items[index].position = data.position;
                  this.nothingChanged = true;
                  this.warehouseService.setItems(_items);
                  this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: 'Položka byla úspěšně upravena.' });
                }
              })
            ).subscribe({
              error: error => this.handleError(error)
            });

            this.destroyRef.onDestroy(() => {
              subscription.unsubscribe();
            });
          }
        });
    }
  }

  onDelete(id: number) {
    this.confirmService.confirm('Opravdu smazat skladovou položku?')
      .then((confirmed) => {
        if (confirmed) {
          this.isLoading = true;
          const subscription = this.warehouseService.deleteWarehouseItem(id).pipe(
            concatMap(response => {
              if (response === null) {
                this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
              } else if (response.isSuccess === false) {
                this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
              } else {
                let _items = [...this.items()];
                _items = _items.filter(i => { return i.id !== id });
                this.warehouseService.setItems(_items);
                if (_items.length === 0) {
                  this.warehouseService.warehouseCard.set({ id: 0, warehouseItemId: 0, warehouseItemName: '', monthYear: '', monthYearName: '', destination: '', units: [] });
                }
                this.isLoading = false;
                this.onBack();
                this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: 'Položka byla úspěšně odstraněna.' });
              }
              return of();
            }),
          ).subscribe({
            next: () => {
            },
            error: error => this.handleError(error)
          });

          this.destroyRef.onDestroy(() => {
            subscription.unsubscribe();
          });
        }
      });
  }

  checkValues() {
    let name = true;
    let shortName = true;
    if (this.selectedItem.name !== this.itemForm.value.name) {
      name = false;
    } else { }
    if (this.selectedItem.shortName !== this.itemForm.value.shortName) {
      shortName = false;
    }
    this.nothingChanged = name && shortName;
  }

  private changePosition() {
    let _items = [...this.items()];
    for (let i = 0; i < _items.length; i++) {
      _items[i].position = i;
    }
    const subscription = this.warehouseService.reorderWarehouseItems(_items).pipe(
      tap(response => {
        this.isLoading = false;
        if (response === null) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
        } else if (response.isSuccess === false) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else {
          this.warehouseService.setItems(response.result);
        }
      }),
      tap({
        error: error => this.handleError(error)
      })
    ).subscribe();
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  private getWarehouseCard(monthYear: string, destination: string, warehouseItemId: number) {
    const subscription = this.warehouseService.getWarehouseCard(monthYear, destination, warehouseItemId).pipe(
      tap(response => {
        if (response === null) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
        } else if (response.isSuccess === false) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else {
          this.warehouseService.setWarehouseCard(response.result);
        }
      }),
      tap({
        error: error => this.handleError(error)
      })
    ).subscribe();

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  private initializedItemForm() {
    this.itemForm = new FormGroup({
      'id': new FormControl({
        value: this.selectedItem.id,
        disabled: true
      }),
      'name': new FormControl({
        value: this.selectedItem.name,
        disabled: false
      }, [
        Validators.required,
        Validators.maxLength(7)
      ]
      ),
      'shortName': new FormControl({
        value: this.selectedItem.shortName,
        disabled: false
      }, [Validators.required,
      Validators.maxLength(3)]),
      'position': new FormControl({
        value: this.selectedItem.position,
        disabled: false
      })
    });
  }

  private patchForm() {
    this.itemForm.patchValue({
      id: this.selectedItem.id,
      name: this.selectedItem.name,
      shortName: this.selectedItem.shortName,
      position: this.selectedItem.position
    });
  }

  private handleError = (errorRes: HttpErrorResponse) => {
    this.isLoading = false;
    return this.errorHandlingService.handleError(errorRes);
  };
}