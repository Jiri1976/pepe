import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HideElementDirective } from '../../directives/hide-element.directive';
import { ProposalsService } from '../../services/proposals.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-main',
  imports: [RouterLink, HideElementDirective],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  private proposalsService = inject(ProposalsService);
  private usersService = inject(UsersService);

  ngOnInit(): void {
    this.proposalsService.resetCalendars();
    this.usersService.navigationOpen.set(true);
  }
}