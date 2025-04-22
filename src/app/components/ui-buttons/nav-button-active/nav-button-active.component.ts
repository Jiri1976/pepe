import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-nav-button-active',
  imports: [],
  templateUrl: './nav-button-active.component.html',
  styleUrl: './nav-button-active.component.scss'
})
export class NavButtonActiveComponent {
  background = input.required<string>();
  color = input.required<string>();
  icon = input.required<string>();
  text = input.required<string>();
  isActive = input<boolean>();
  clicked = output<void>();
  isDisabled = input<boolean>();

  onPress() {
    this.clicked.emit();
  }
}
