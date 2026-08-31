import { Component, input } from '@angular/core';
import { ProposalUser } from '../../../models/proposals.interface';
import { ProposalPitBackgroundDirective } from '../../../directives/proposal-pit-background.directive';

@Component({
  selector: 'app-proposal-pit',
  imports: [ProposalPitBackgroundDirective],
  templateUrl: './proposal-pit.component.html',
  styleUrl: './proposal-pit.component.scss',
})
export class ProposalPitComponent {
  user = input.required<ProposalUser>();
}
