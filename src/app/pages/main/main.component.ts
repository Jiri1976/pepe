import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HideElementDirective } from '../../directives/hide-element.directive';
import { ProposalsService } from '../../services/proposals.service';

@Component({
  selector: 'app-main',
  imports: [RouterLink, HideElementDirective],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  private proposalsService = inject(ProposalsService);

  ngOnInit(): void {
    this.proposalsService.resetCalendars();
  }
}