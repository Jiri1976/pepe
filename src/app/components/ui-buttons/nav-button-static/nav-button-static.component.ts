import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-nav-button-static',
  imports: [],
  templateUrl: './nav-button-static.component.html',
  styleUrl: './nav-button-static.component.scss'
})
export class NavButtonStaticComponent {
  background = input.required<string>();
  color = input.required<string>();
  icon = input.required<string>();
  text = input.required<string>();
  isDisabled = input<boolean>();
  clicked = output<void>();

  onPress() {
    this.clicked.emit();
  }
}
