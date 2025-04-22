import { Component, input } from '@angular/core';

@Component({
  selector: 'proposal-button',
  imports: [],
  templateUrl: './proposal-button.component.html',
  styleUrl: './proposal-button.component.scss'
})
export class ProposalButtonComponent {
  timeFrom = input.required<string>();
  timeTo = input.required<string>();
}
