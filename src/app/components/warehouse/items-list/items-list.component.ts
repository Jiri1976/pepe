import { CommonModule } from '@angular/common';
import { Component, input, InputSignal, model, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-items-list',
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './items-list.component.html',
  styleUrl: './items-list.component.scss'
})
export class ItemsListComponent {
  visible = input.required<boolean>();
  items = input.required<{
    name: string;
    id: number;
  }[]>();
  selected = output<number>();

  onSelectItem(itemId: number) {
    this.selected.emit(itemId);
  }
}
