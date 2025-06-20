import { Component } from '@angular/core';

@Component({
  selector: 'app-proposal-skeleton',
  imports: [],
  templateUrl: './proposal-skeleton.component.html',
  styleUrl: './proposal-skeleton.component.scss'
})
export class ProposalSkeletonComponent {
  emptyDays = new Array(31);
  emptyUsers = new Array(13);
}
