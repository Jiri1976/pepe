import { Component, input } from '@angular/core';
import { ProposalUser } from '../../../models/proposals.interface';

@Component({
  selector: 'app-proposal-pit',
  imports: [],
  templateUrl: './proposal-pit.component.html',
  styleUrl: './proposal-pit.component.scss',
})
export class ProposalPitComponent {
  user = input.required<ProposalUser>();
}
