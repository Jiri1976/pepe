import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { HideElementDirective } from '../../directives/hide-element.directive';
import { ProposalsService } from '../../services/proposals.service';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlingService } from '../../services/error-handling.service';
import { AlertService } from '../../services/alert.service';
import { tap } from 'rxjs';
import { ProposalOverview, ProposalOverviewUser } from '../../models/proposals/proposalOverview.interface';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-main',
  imports: [RouterLink, HideElementDirective, RouterOutlet, CardModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  private PEPE_HUB = environment.PEPE_HUB;
  private proposalsService = inject(ProposalsService);
  private authService = inject(AuthService);
  private errorHandlingService = inject(ErrorHandlingService);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private hubUser: string = '';
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
  token = this.authService.getToken();

  connection = new signalR.HubConnectionBuilder()
    .withUrl(this.PEPE_HUB, {
      accessTokenFactory: () => this.token!
    })
    .configureLogging(signalR.LogLevel.Error)
    .withAutomaticReconnect()
    .build();

  constructor() {
    this.start();

    this.connection.on("UpdateProposals", (user: string, isUpdate: boolean, destination: string, messageTime: string) => {
      const hours = new Date(messageTime).getHours();
      const minutes = new Date(messageTime).getMinutes() < 10 ? `0${new Date(messageTime).getMinutes()}` : new Date(messageTime).getMinutes();

      if (isUpdate && user !== this.hubUser && this.user().role === 'Admin') {
        this.getProposalsOverview();
        this.alertService.setAlert({ severity: 'info', summary: 'Info', detail: `${hours}:${minutes} Rozpis pro ${destination} aktualizoval ${user.split('-')[0]}.` });
      } else if (isUpdate && user !== this.hubUser && this.user().role === 'Master' && this.user().destination === destination) {
        this.getProposalsOverview();
        this.alertService.setAlert({ severity: 'info', summary: 'Info', detail: `${hours}:${minutes} Rozpis pro ${destination} aktualizoval ${user.split('-')[0]}.` });
      }
    });
  }

  ngOnInit(): void {
    if (this.user().role === 'Admin') {
      this.proposalsService.destination.set('F-M');
    } else {
      this.proposalsService.destination.set(this.user().destination);
    }
    this.proposalsService.resetCalendars();
    this.getProposalsOverview();
  }

  onGoToFMPlans() {
    this.proposalsService.destination.set('F-M');
    this.router.navigate(['plans']);
  }

  onGoToOvaPlans() {
    this.proposalsService.destination.set('OVA');
    this.router.navigate(['plans']);
  }


  public async start() {
    this.hubUser = `${this.user().name}-${Date.parse(new Date().toISOString())}`;
    try {
      await this.connection.start();
      await this.joinRoom(this.hubUser, 'proposals');
    } catch (error) {
      this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Nepodařilo se navázat spojení s hubem.' });
    }
  }

  public async joinRoom(user: string, room: string) {
    try {
      return this.connection.invoke("JoinRoom", { user, room });
    } catch (error) {
      console.log('MAIN - JOIN ROOM ERROR: ', error);
    }
  }

  public async leaveRoom() {
    try {
      return this.connection.stop();
    } catch (error) {
      console.log('MAIN - LEAVE CHAT ERROR: ', error);
    }
  }

  public async updateProposals(destination: string, isUpdating: boolean) {
    try {
      return this.connection.invoke("UpdateProposals", destination, isUpdating);
    } catch (error) {
      console.log('MAIN - UPDATE PROPOSALS ERROR: ', error);
    }
  }

  ngOnDestroy(): void {
    this.leaveRoom();
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