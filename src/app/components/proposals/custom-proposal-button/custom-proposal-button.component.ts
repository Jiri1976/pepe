import { Component, input } from '@angular/core';

@Component({
  selector: 'custom-proposal-button',
  imports: [],
  templateUrl: './custom-proposal-button.component.html',
  styleUrl: './custom-proposal-button.component.scss'
})
export class CustomProposalButtonComponent {
  timeFrom = input.required<string>();
  timeTo = input.required<string>();
}
