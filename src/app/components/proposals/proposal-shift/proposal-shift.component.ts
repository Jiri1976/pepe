import { Component, input } from '@angular/core';
import { ProposalShift } from '../../../models/proposals/proposalShift.interface';
import { CommonModule } from '@angular/common';
import { isFridayOrSaturday } from '../../../helpers/is-friday-saturday.helper';

@Component({
  selector: 'app-proposal-shift',
  imports: [CommonModule],
  templateUrl: './proposal-shift.component.html',
  styleUrl: './proposal-shift.component.scss'
})
export class ProposalShiftComponent {
  shift = input.required<ProposalShift>();

  get shiftType() {
    const s = this.shift();
    if (!s?.from || !s?.to) return null;

    if (s.from === '11:00' && (s.to === '22:00' || s.to === '23:00')) {
      const fridayOrSaturday = isFridayOrSaturday(s.proposalDate);
      if (fridayOrSaturday) {
        if (s.to !== '23:00') {
          return 'custom';
        }
      }
      return 'whole';
    }
    if (s.from === 'F-M' || s.from === 'OVA') {
      return 'destination';
    }
    if (s.from === '11:00' && s.to === '17:00') {
      return 'morning';
    }
    if (s.from === '17:00' && (s.to === '22:00' || s.to === '23:00')) {
      return 'afternoon';
    }
    return 'custom';
  }
}
