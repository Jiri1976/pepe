import { Component, input } from '@angular/core';
import { ProposalShift } from '../../../models/proposals/proposalShift.interface';

@Component({
  selector: 'app-proposal-shift',
  imports: [],
  templateUrl: './proposal-shift.component.html',
  styleUrl: './proposal-shift.component.scss'
})
export class ProposalShiftComponent {
  shift = input.required<ProposalShift>();
}
