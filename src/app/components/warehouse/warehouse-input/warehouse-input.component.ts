import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { WarehouseStore } from '../../../stores/warehouse-store/warehouse.store';
import { AuthStore } from '../../../stores/auth-store/auth.store';
import { disabled, form, FormField, pattern } from '@angular/forms/signals';
import {
  isToday,
  isNotTomorrow,
} from '../../../helpers/common-functions.helper';
import { WarehouseUnit } from '../../../models/warehouses.interface';

interface UnitForm {
  amount: string;
}

@Component({
  selector: 'app-warehouse-input',
  imports: [ButtonModule, FormField],
  templateUrl: './warehouse-input.component.html',
  styleUrl: './warehouse-input.component.scss',
})
export class WarehouseInputComponent {
  readonly warehouseStore = inject(WarehouseStore);
  readonly authStore = inject(AuthStore);
  isToday = isToday;
  isNotTomorrow = isNotTomorrow;
  card = computed(() => this.warehouseStore.selectedCard());
  unit = input.required<WarehouseUnit>();
  user = this.authStore.user;
  selectedIndex = computed(() => this.warehouseStore.sliceIndex);
  units = computed(() => this.warehouseStore.selectedCard()?.units ?? []);
  currentUnitIndex = computed(() =>
    this.warehouseStore
      .selectedCard()
      ?.units.findIndex((u) => u.id === this.unit().id),
  );

  diffValue = computed(() => {
    const parsed = parseInt(this.form().value().amount);
    if (isNaN(parsed)) {
      return -999999;
    }

    if (
      this.currentUnitIndex() === 0 &&
      this.card()?.lastMonthAmount !== null
    ) {
      return parsed - (this.card()?.lastMonthAmount ?? 0);
    }

    return parsed - this.getLastValue(this.currentUnitIndex()!);
  });

  backgroundStyles = computed(() => {
    if (this.diffValue() === -999999) {
      return {
        background: 'var(--main-border-color)',
        border: '1px solid var(--main-border-color)',
        color: 'var(--main-border-color)',
      };
    }
    return {
      border:
        this.diffValue() < 0
          ? '1px solid var(--orange-primary)'
          : '1px solid var(--proposal-lime)',
      background:
        this.diffValue() < 0 ? 'var(--orange-primary)' : 'var(--proposal-lime)',
      color: this.diffValue() < 0 ? 'var(--white)' : 'var(--main-dark)',
    };
  });

  protected model = signal<UnitForm>({
    amount: '',
  });

  protected form = form(this.model, (s) => {
    disabled(s.amount!, {
      when: (_) => !isToday(this.unit().date) && this.user()?.role === 'Master',
    });
    pattern(s.amount!, /^[0-9]*$/);
  });

  ngOnInit() {
    this.model.set({
      amount: this.unit().amount?.toString() ?? '',
    });
  }

  constructor() {
    effect(() => {
      this.model.set({
        amount: this.unit().amount?.toString() ?? '',
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
    let _selectedUnit = _card.units.find((u) => u.date === this.unit()!.date)!;

    if (_selectedUnit.amount === null && this.form().value().amount === '') {
      return;
    }

    const value = this.form().value().amount;
    if (value !== undefined) {
      _selectedUnit.amount = parseInt(this.form().value().amount);
    } else {
      _selectedUnit.amount = undefined;
    }
    this.warehouseStore.createUpdateWarehouseCard(
      _card,
      `${_card.monthYearName}, ${_card.warehouseItemName.toLocaleLowerCase()} - ${_selectedUnit.amount ? _selectedUnit.amount + 'ks' : 'anulováno'}`,
    );
  }

  private getLastValue(index: number): number {
    for (let i = index - 1; i >= 0; i--) {
      const unit = this.units()[i];
      if (
        unit.amount !== null &&
        !isNaN(parseInt(unit.amount?.toString() ?? ''))
      ) {
        return unit.amount!;
      }
    }
    return 0;
  }
}
