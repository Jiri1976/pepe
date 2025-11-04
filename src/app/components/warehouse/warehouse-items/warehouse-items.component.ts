import { Component, computed, DestroyRef, effect, ElementRef, HostListener, inject, model, OnInit, signal, viewChild } from '@angular/core';
import { WidgetComponent } from "../widget/widget.component";
import { CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { wrapGrid } from 'animate-css-grid';
import { tap } from 'rxjs';
import { WarehouseService } from '../../../services/warehouse.service';
import { ConfirmService } from '../../../services/confirm.service';
import { WarehouseItem } from '../../../models/warehouse/warehouse-item.interface';
import { ToasterService } from '../../../services/toaster.service';
import { SignalService } from '../../../services/signal.service';

@Component({
  selector: 'app-warehouse-items',
  imports: [WidgetComponent, CdkDropList, CdkDropListGroup],
  templateUrl: './warehouse-items.component.html',
  styleUrl: './warehouse-items.component.scss'
})
export class WarehouseItemsComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private warehouseService = inject(WarehouseService);
  private toaster = inject(ToasterService);
  private confirmService = inject(ConfirmService);
  private signalService = inject(SignalService);
  dashboard = viewChild.required<ElementRef>('dashboard');
  isLoading = signal(false);
  items = computed(() => this.warehouseService.items());
  originals: WarehouseItem[] = [];
  selected = signal<WarehouseItem>({ id: 0, name: '', position: -1 });
  isDroppedToDelete = signal(false);
  isDragged = signal(false);
  reorderedItems = model<WarehouseItem[]>([]);
  reloadItems = computed(() => this.warehouseService.reloadItems());
  bodyStyles = signal<any>({});

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.setBodyStyles();
  }

  constructor() {
    effect(() => {
      if (this.reloadItems()) {
        this.uploadItems();
      }
      this.setBodyStyles();
    });
  }

  ngOnInit() {
    this.warehouseService.warehouseNav.set('items');
    this.uploadItems();
    this.setBodyStyles();
  }

  ngAfterViewInit() {
    this.warehouseService.setComponent(this);
  }

  onAddItem() {
    const newItem: WarehouseItem = {
      id: 0,
      name: '',
      position: this.items().length + 1
    }
    let _items = [newItem, ...this.items()];
    this.warehouseService.setItems(_items);
  }

  drop(event: CdkDragDrop<number, any>) {
    let _items = [...this.items()];
    const isUnsaved = _items.filter(i => i.id === 0);
    if (isUnsaved.length > 0) {
      this.toaster.error('Nejdříve ulož položku!');
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

      const subscription = this.warehouseService.reorderWarehouseItems(this.reorderedItems()).pipe(
        tap(response => {
          if (response === null) {
            this.toaster.error('Něco se pokazilo, zkus to znovu.');
          } else if (response.isSuccess === false) {
            this.toaster.error(response.errorMessage);
          } else if (response.isSuccess) {
            this.warehouseService.setItems(response.result);
            this.reorderedItems.set([]);
            this.signalService.sendCards('F-M', false, true);
            this.toaster.success('Pořadí položek bylo změněno.');
          }
        }),
      ).subscribe({
        error: () => this.isLoading.set(false),
      });

      this.destroyRef.onDestroy(() => subscription.unsubscribe());
    }
  }

  onDelete(item: WarehouseItem) {
    this.isDroppedToDelete.set(true);
    if (item.id === 0) {
      this.isDroppedToDelete.set(false);
      let _items = [...this.items()];
      let removed_items = _items.filter(i => i.position !== item.position);
      this.warehouseService.setItems(removed_items);
      return;
    }

    this.confirmService.confirm(`Opravdu smazat položku ${item.name}?`)
      .then((confirmed) => {
        if (confirmed) {
          this.isLoading.set(true);
          const subscription = this.warehouseService.deleteWarehouseItem(item.id).pipe(
            tap(response => {
              if (response === null) {
                this.isDroppedToDelete.set(false);
                this.toaster.error('Něco se pokazilo, zkus to znovu.');
                this.isLoading.set(false);
              } else if (response.isSuccess === false) {
                this.isDroppedToDelete.set(false);
                this.isLoading.set(false);
                this.toaster.error(response.errorMessage);
              } else if (response.isSuccess) {
                let _items = [...this.items()];
                let removed_items = _items.filter(i => i.id !== item.id);
                this.warehouseService.setItems(removed_items);
                this.isDroppedToDelete.set(false);
                this.signalService.sendCards('F-M', false, true);
                this.isLoading.set(false);
                this.toaster.success(response.result);
              }
            }),
          ).subscribe({
            error: () => this.isLoading.set(false)
          });

          this.destroyRef.onDestroy(() => subscription.unsubscribe());
        } else {
          this.isDroppedToDelete.set(false);
        }
      });
  }

  uploadItems() {
    this.isLoading.set(true);
    this.warehouseService.reloadItems.set(false);
    const subscription = this.warehouseService.getAllWarehouseItems().pipe(
      tap(response => {
        if (response === null) {
          this.toaster.error('Něco se pokazilo, zkus to znovu.');
          this.isLoading.set(false);
        } else if (response.isSuccess === false) {
          this.isLoading.set(false);
          this.toaster.error(response.errorMessage);
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
      error: () => this.isLoading.set(false)
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  private setBodyStyles() {
    if (this.items()?.length > 11) {
      if (window.innerHeight < 700) {
        this.bodyStyles.set({
          'maxHeight': '550px',
          'overflow-y': 'scroll'
        });
      } else {
        this.bodyStyles.set({
          'maxHeight': '',
          'overflow-y': 'hidden'
        });
      }
    } else {
      this.bodyStyles.set({
        'maxHeight': '',
        'overflow-y': 'hidden'
      });
    }
  }
}