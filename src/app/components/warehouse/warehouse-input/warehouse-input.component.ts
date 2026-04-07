import { Component, effect, inject, input, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { WarehouseStore } from '../../../stores/warehouse-store/warehouse.store';
import { AuthStore } from '../../../stores/auth-store/auth.store';
import { disabled, form, FormField, pattern } from '@angular/forms/signals';
import { isToday, isNotTomorrow } from '../../../helpers/common-functions.helper';
import { WarehouseUnit } from '../../../models/warehouses.interface';

interface UnitForm {
  amount: string;
}

@Component({
  selector: 'app-warehouse-input',
  imports: [ButtonModule, FormField],
  templateUrl: './warehouse-input.component.html',
  styleUrl: './warehouse-input.component.scss'
})
export class WarehouseInputComponent {
  readonly warehouseStore = inject(WarehouseStore);
  readonly authStore = inject(AuthStore);
  isToday = isToday;
  isNotTomorrow = isNotTomorrow;
  card = this.warehouseStore.selectedCard;
  unit = input.required<WarehouseUnit>();
  user = this.authStore.user;
  selectedIndex = this.warehouseStore.sliceIndex;

  protected model = signal<UnitForm>({
    amount: ''
  });

  protected form = form(this.model, s => {
    disabled(s.amount!, _ => !isToday(this.unit().date) && this.user()?.role === 'Master');
    pattern(s.amount!, /^[0-9]*$/);
  });

  ngOnInit() {
    this.model.set({
      amount: this.unit().amount?.toString() ?? ''
    });
  }

  constructor() {
    effect(() => {
      this.model.set({
        amount: this.unit().amount?.toString() ?? ''
      });

    });
  }

  onSave(event: any) {
    event.preventDefault();
    event.stopPropagation();
    if (this.form().invalid()) {
      return;
    }
    this.warehouseStore.setSelectedUnit(this.unit());
    let _card = structuredClone(this.card()!);
    let _selectedUnit = _card.units.find(u => u.date === this.unit()!.date)!;

    if (_selectedUnit.amount === null && this.form().value().amount === '') {
      return;
    }

    const value = this.form().value().amount;
    if (value !== undefined) {
      _selectedUnit.amount = parseInt(this.form().value().amount);
    } else {
      _selectedUnit.amount = undefined;
    }
    this.warehouseStore.createUpdateWarehouseCard(_card);
  }
}