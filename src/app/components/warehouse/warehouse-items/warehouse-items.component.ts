import { Component, computed, DestroyRef, ElementRef, inject, model, OnInit, signal, viewChild } from '@angular/core';
import { WidgetComponent } from "../widget/widget.component";
import { CdkDragDrop, CdkDragPlaceholder, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { wrapGrid } from 'animate-css-grid';
import { HttpErrorResponse } from '@angular/common/http';
import { tap } from 'rxjs';
import { ErrorHandlingService } from '../../../services/error-handling.service';
import { WarehouseService } from '../../../services/warehouse.service';
import { AlertService } from '../../../services/alert.service';
import { ConfirmService } from '../../../services/confirm.service';
import { WarehouseItem } from '../../../models/warehouse/warehouse-item.interface';
import { trigger, transition, animate, style } from '@angular/animations';

@Component({
  selector: 'app-warehouse-items',
  imports: [WidgetComponent, CdkDropList, CdkDropListGroup, CdkDragPlaceholder],
  templateUrl: './warehouse-items.component.html',
  styleUrl: './warehouse-items.component.scss',
  animations: [
    trigger('fadeOut', [
      transition(':leave', [
        animate('500ms ease-out', style({ opacity: 0 })),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-in', style({ opacity: 1 })),
      ])
    ]),
  ]
})
export class WarehouseItemsComponent implements OnInit {
  private errorHandlingService = inject(ErrorHandlingService);
  private destroyRef = inject(DestroyRef);
  private warehouseService = inject(WarehouseService);
  private alertService = inject(AlertService);
  private confirmService = inject(ConfirmService);
  dashboard = viewChild.required<ElementRef>('dashboard');
  isLoading = signal(false);
  items = computed(() => this.warehouseService.items());
  originals: WarehouseItem[] = [];
  selected = signal<WarehouseItem>({ id: 0, name: '', shortName: '', position: -1 });
  isDroppedToDelete = signal(false);
  isDragged = signal(false);
  reorderedItems = model<WarehouseItem[]>([]);

  ngOnInit() {
    this.uploadItems();
  }

  ngAfterViewInit() {
    this.warehouseService.setComponent(this);
  }

  onAddItem() {
    const newItem: WarehouseItem = {
      id: 0,
      name: '',
      shortName: '',
      position: this.items().length + 1
    }
    let _items = [newItem, ...this.items()];
    this.warehouseService.setItems(_items);
  }

  drop(event: CdkDragDrop<number, any>) {
    let _items = [...this.items()];
    const isUnsaved = _items.filter(i => i.id === 0);
    if (isUnsaved.length > 0) {
      this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Nejdříve ulož položku!' });
      return;
    }
    const { previousContainer, container, item: { data } } = event;

    if (previousContainer.data !== container.data) {
      this.warehouseService.updateWidgetPosition(previousContainer.data, container.data);
      let _reorderedItems = [...this.items()];
      for (let i = 0; i < _items.length; i++) {
        _reorderedItems[i].position = i + 1;
      }
      this.reorderedItems.set(_reorderedItems);
    }

  }

  onDeleteDrop() {
    this.isDroppedToDelete.set(true);
    let _items = [...this.items()];
    let removed_items = _items.filter(i => i.position !== this.selected().position);
    this.warehouseService.setItems(removed_items);
    const index = _items.indexOf(this.selected());

    if (_items[index].id === 0) {
      this.isDroppedToDelete.set(false);
      return;
    }

    this.confirmService.confirm(`Opravdu smazat položku ${this.selected().name}?`)
      .then((confirmed) => {
        if (confirmed) {
          this.isLoading.set(true);
          const subscription = this.warehouseService.deleteWarehouseItem(this.selected().id).pipe(
            tap(response => {
              if (response === null) {
                this.warehouseService.setItems(_items);
                this.isDroppedToDelete.set(false);
                this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
                this.isLoading.set(false);
              } else if (response.isSuccess === false) {
                this.warehouseService.setItems(_items);
                this.isDroppedToDelete.set(false);
                this.isLoading.set(false);
                this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
              } else if (response.isSuccess) {
                let _items = [...this.items()];
                this.warehouseService.setItems(_items);
                this.isDroppedToDelete.set(false);
                this.isLoading.set(false);
                this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: response.result });
              }
            }),
          ).subscribe({
            error: (error) => this.handleError(error),
          });

          this.destroyRef.onDestroy(() => subscription.unsubscribe());
        } else {
          this.isDroppedToDelete.set(false);
          this.warehouseService.setItems(_items);
        }
      });
  }

  uploadItems() {
    this.isLoading.set(true);
    const subscription = this.warehouseService.getAllWarehouseItems().pipe(
      tap(response => {
        if (response === null) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
          this.isLoading.set(false);
        } else if (response.isSuccess === false) {
          this.isLoading.set(false);
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else if (response.isSuccess) {
          this.isLoading.set(false);
          if (response.result.length > 0) {
            this.originals = response.result;
            this.warehouseService.setItems(response.result);
            setTimeout(() => {
              wrapGrid(this.dashboard().nativeElement, {
                duration: 300
              });
            }, 500);
          }
        }
      }),

    ).subscribe({
      next: () => { },
      error: error => this.handleError(error)
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  private handleError = (errorRes: HttpErrorResponse) => {
    this.isLoading.set(false);
    return this.errorHandlingService.handleError(errorRes);
  };
}