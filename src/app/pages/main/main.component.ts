import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HideElementDirective } from '../../directives/hide-element.directive';
import { ProposalsService } from '../../services/proposals.service';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlingService } from '../../services/error-handling.service';
import { AlertService } from '../../services/alert.service';
import { tap } from 'rxjs';
import { ProposalOverview, ProposalOverviewUser } from '../../models/proposals/proposalOverview.interface';

@Component({
  selector: 'app-main',
  imports: [RouterLink, HideElementDirective, RouterOutlet, CardModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  private proposalsService = inject(ProposalsService);
  private authService = inject(AuthService);
  private errorHandlingService = inject(ErrorHandlingService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  loading = signal(false);
  user = computed(() => this.authService.user());
  fmCooks = signal<ProposalOverviewUser[]>([]);
  fmDrivers = signal<ProposalOverviewUser[]>([]);
  ovaCooks = signal<ProposalOverviewUser[]>([]);
  ovaDrivers = signal<ProposalOverviewUser[]>([]);
  today = new Date();
  day = this.today.getDate() < 10 ? `0${this.today.getDate()}` : `${this.today.getDate()}`;
  month = this.today.getMonth() + 1 < 10 ? `0${this.today.getMonth() + 1}` : `${this.today.getMonth() + 1}`;
  year = this.today.getFullYear();

  ngOnInit(): void {
    this.proposalsService.resetCalendars();
    this.getProposalsOverview();
  }

  private getProposalsOverview() {
    this.loading.set(true);
    const subscription = this.proposalsService.getProposalsOverview().pipe(
      tap(response => {
        if (response === null) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
        } else if (response.isSuccess === false) {
          this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
        } else if (response.isSuccess === true) {
          const overview: ProposalOverview = response.result;
          overview.proposalsOverview.forEach((_overview) => {
            if (_overview.destination === 'F-M') {
              this.fmCooks.set(_overview.cooks);
              this.fmDrivers.set(_overview.drivers);
            }
            if (_overview.destination === 'OVA') {
              this.ovaCooks.set(_overview.cooks);
              this.ovaDrivers.set(_overview.drivers);
            }
          });
          this.loading.set(false);
        }
      }),
    ).subscribe({
      next: () => { },
      error: error => this.handleError(error)
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  private handleError = (errorRes: HttpErrorResponse) => {
    this.loading.set(false);
    return this.errorHandlingService.handleError(errorRes);
  };
}