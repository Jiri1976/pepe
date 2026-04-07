import { Component, computed, effect, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { ProposalsService } from '../../services/proposals.service';
import { ProposalSkeletonComponent } from "./proposal-skeleton/proposal-skeleton.component";
import { CdkDrag, CdkDragHandle, CdkDragPlaceholder, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { ProposalShiftComponent } from "./proposal-shift/proposal-shift.component";
import { DisabledClassDirective } from '../../directives/disabled-class.directive';
import { SetBackgroundDirective } from '../../directives/set-background.directive';
import { ProposalTableStyleDirective } from '../../directives/proposal-table-style.directive';
import { AuthStore } from '../../stores/auth-store/auth.store';
import { ProposalStore } from '../../stores/proposal-store/proposal.store';
import { ProposalUserBackgroundDirective } from '../../directives/proposal-user-background.directive';
import { ProposalUser, ProposalShift } from '../../models/proposals.interface';

@Component({
  selector: 'app-proposals',
  imports: [
    ProposalSkeletonComponent,
    ProposalShiftComponent,
    DisabledClassDirective,
    SetBackgroundDirective,
    ProposalUserBackgroundDirective,
    ProposalTableStyleDirective,
    CdkDropList,
    CdkDropListGroup,
    CdkDrag,
    CdkDragPlaceholder,
    CdkDragHandle
  ],
  templateUrl: './proposals.component.html',
  styleUrl: './proposals.component.scss'
})
export class ProposalsComponent {
  readonly authStore = inject(AuthStore);
  readonly propStore = inject(ProposalStore);
  private PEPE_HUB = environment.PEPE_HUB;
  dashboard = viewChild.required<ElementRef>('dashboard');
  proposalsService = inject(ProposalsService);
  hubUser = `${this.authStore.user()?.name}`;
  token = this.authStore.user()?.token;
  updateHub = computed(() => this.proposalsService.updateHub());
  bodyStyles = signal<any>({});

  hubEffect = effect(() => {
    if (this.updateHub()) {
      this.updateProposals(this.propStore.destination(), true);
    }
    this.setBodyStyles();
  });

  @HostListener('window:resize')
  onWindowResize() {
    this.setBodyStyles();
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl(this.PEPE_HUB, {
      accessTokenFactory: () => this.token!
    })
    .configureLogging(signalR.LogLevel.Error)
    .withAutomaticReconnect()
    .build();

  readonly warning = computed(() => {
    if (this.propStore.isUnsavedPassedCard()) {
      return `Rozpis směn pro ${this.propStore.currentCard()!.monthYearName.toLowerCase()} není uložen.`
    } else if (this.propStore.currentCard()?.users?.length === 0 && this.propStore.currentCard()?.inactiveUsers?.length === 0) {
      return `Chybí evidovaní pracovníci na pobočce - ${this.propStore.currentCard()?.destination}`
    } else if (this.propStore.currentCard()?.users?.length === 0 && this.propStore.currentCard()!.inactiveUsers!.length > 0) {
      return `Přidej pracovníky z ${this.propStore.currentCard()?.destination} pro ${this.propStore.currentCard()!.monthYearName.toLowerCase()}`
    }
    return null;
  });

  constructor() {
    // this.start();
    // this.connection.on("UpdateProposals", (user: string, isUpdate: boolean, destination: string, messageTime: string) => {
    //   const hours = new Date(messageTime).getHours();
    //   const minutes = new Date(messageTime).getMinutes() < 10 ? `0${new Date(messageTime).getMinutes()}` : new Date(messageTime).getMinutes();

    //   if (isUpdate && user !== this.hubUser && this.loggedUser.role === 'Admin') {
    //     if (destination === this.proposalsService.destination()) {
    //       this.proposalsService.uploadProposals();
    //     }
    //     this.alertService.setAlert({ severity: 'info', summary: 'Info', detail: `${hours}:${minutes} Rozpis pro ${destination} aktualizoval ${user}.` });
    //   } else if (isUpdate && user !== this.hubUser && this.loggedUser.role === 'Master') {
    //     if (destination === this.proposalsService.destination()) {
    //       this.proposalsService.uploadProposals();
    //       this.alertService.setAlert({ severity: 'info', summary: 'Info', detail: `${hours}:${minutes} Rozpis pro ${destination} aktualizoval ${user}.` });
    //     }
    //   }
    // });
  }

  ngOnInit(): void {
    const user = this.authStore.user();
    if (user?.role === 'master' && user.destination !== this.propStore.destination()) {
      this.propStore.setDestination(user.destination);
    }
    this.propStore.uploadSchedulesShifts();
    this.setBodyStyles();
  }

  public async start() {
    try {
      await this.connection.start();
      await this.joinRoom(this.hubUser, 'proposals');
    } catch (error) {
      this.authStore.warning('Nepodařilo se navázat spojení s hubem.');
    }
  }

  public async joinRoom(user: string, room: string) {
    try {
      return this.connection.invoke("JoinRoom", { user, room });
    } catch (error) {
      console.log('PROPOSALS - JOIN ROOM ERROR: ', error);
    }
  }

  public async updateProposals(destination: string, isUpdating: boolean) {
    try {
      this.proposalsService.updateHub.set(false);
      return this.connection.invoke("UpdateProposals", destination, isUpdating);
    } catch (error) {
      console.log('PROPOSALS - UPDATE PROPOSALS ERROR: ', error);
    }
  }

  public async leaveRoom() {
    try {
      return this.connection.stop();
    } catch (error) {
      console.log('PROPOSALS - LEAVE CHAT ERROR: ', error);
    }
  }

  remove(user: ProposalUser, index: number) {
    const userShifts = user.shifts.filter(s => s.from !== null && s.to !== null && s.from !== 'F-M' && s.from !== 'OVA');
    this.propStore.removeFromActive(user, index, userShifts);
  }

  drop(event: CdkDragDrop<number, any>) {
    this.propStore.updatePositions(event.previousIndex, event.currentIndex);
  }

  isWeekend(date: string) {
    var day = new Date(parseInt(date.split('.')[2]), parseInt(date.split('.')[1]) - 1, parseInt(date.split('.')[0]));
    if (day.getDay() == 0 || day.getDay() == 5 || day.getDay() == 6) {
      return true;
    }
    return false;
  }

  dayOfWeek(date: string) {
    var day = new Date(parseInt(date.split('.')[2]), parseInt(date.split('.')[1]) - 1, parseInt(date.split('.')[0]));
    let days = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
    return days[day.getDay()];
  }

  onCreateUpdateProposal(selectedProposal: ProposalShift) {
    if (this.authStore.user()?.role === 'Master' && this.isPassedTime(selectedProposal.proposalDate)) {
      return;
    }
    this.propStore.selectProposal(selectedProposal);
  }

  isPassedTime(date: string) {
    let _day = parseInt(date.split('.')[0]);
    let _year = parseInt(date.split('.')[2]);
    let _month = parseInt(date.split('.')[1]) - 1;
    let today = new Date();
    let day = new Date(_year, _month, _day + 1);
    if (day >= today) {
      return false;
    }
    return true;
  }

  ngOnDestroy(): void {
    this.leaveRoom();
  }

  private setBodyStyles() {
    if (this.propStore.currentCard()?.users) {
      if (window.innerHeight < 700) {
        this.bodyStyles.set({
          'maxHeight': '500px',
          'overflow-y': 'auto'
        });
      } else if (window.innerHeight > 700 && window.innerHeight < 920) {
        if (this.propStore.currentCard() && this.propStore.currentCard()!.users.length > 16) {
          this.bodyStyles.set({
            'maxHeight': '680px',
            'overflow-y': 'auto'
          });
        } else {
          this.bodyStyles.set({
            'maxHeight': '',
            'overflow-y': 'hidden'
          });
        }
      } else {
        this.bodyStyles.set({
          'maxHeight': '',
          'overflow-y': 'hidden'
        });
      }
    }
  }
}