import { Component, computed, effect, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { ProposalsService } from '../../services/proposals.service';
import { AuthService } from '../../services/auth.service';
import { UpdateProposalComponent } from "./update-proposal/update-proposal.component";
import { ProposalSkeletonComponent } from "./proposal-skeleton/proposal-skeleton.component";
import { Dialog } from '@angular/cdk/dialog';
import { CdkDrag, CdkDragHandle, CdkDragPlaceholder, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { ProposalShiftComponent } from "./proposal-shift/proposal-shift.component";
import { DisabledClassDirective } from '../../directives/disabled-class.directive';
import { SetBackgroundDirective } from '../../directives/set-background.directive';
import { ProposalTableStyleDirective } from '../../directives/proposal-table-style.directive';
import { ProposalUser } from '../../models/proposals/proposalUser.interface';
import { ConfirmService } from '../../services/confirm.service';
import { ToasterService } from '../../services/toaster.service';

@Component({
  selector: 'app-proposals',
  imports: [
    ProposalSkeletonComponent,
    ProposalShiftComponent,
    DisabledClassDirective,
    SetBackgroundDirective,
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
  private PEPE_HUB = environment.PEPE_HUB;
  private authService = inject(AuthService);
  private toaster = inject(ToasterService);
  private dialog = inject(Dialog)
  private confirmService = inject(ConfirmService);
  dashboard = viewChild.required<ElementRef>('dashboard');
  proposalsService = inject(ProposalsService);
  loggedUser = this.authService.getUser();
  proposalsLoading = computed(() => this.proposalsService.isProposalLoading());
  unsavedProposalCardErrorText = '';
  hubUser = `${this.loggedUser.name}`;
  token = this.authService.getToken();
  updateHub = computed(() => this.proposalsService.updateHub());
  planCard = computed(() => this.proposalsService.schedules().find(c => c.destination === this.proposalsService.destination())!);
  days = computed(() => this.proposalsService.days());
  bodyStyles = signal<any>({});

  hubEffect = effect(() => {
    if (this.updateHub()) {
      this.updateProposals(this.proposalsService.destination(), true);
    }
    this.setBodyStyles();
  });

  @HostListener('window:resize', ['$event'])
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
    this.proposalsService.uploadSchedulesShifts();
    this.setBodyStyles();
  }

  public async start() {
    try {
      await this.connection.start();
      await this.joinRoom(this.hubUser, 'proposals');
    } catch (error) {
      this.toaster.warning('Nepodařilo se navázat spojení s hubem.');
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
    this.confirmService.confirm(`Odstranit uživatele - ${user.name} ${user.surname}?`)
      .then((confirmed) => {
        if (confirmed) {
          this.proposalsService.removeFromActive(user, index);
        }
      });
  }

  drop(event: CdkDragDrop<number, any>) {
    this.proposalsService.updatePositions(event.previousIndex, event.currentIndex);
  }

  isFridayOrSaturday(date: string) {
    var day = new Date(parseInt(date.split('.')[2]), parseInt(date.split('.')[1]) - 1, parseInt(date.split('.')[0]));
    if (day.getDay() == 5 || day.getDay() == 6) {
      return true;
    }
    return false;
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

  onCreateUpdateProposal(userIndex: number, shiftIndex: number) {
    let selectedProposal = { ...this.planCard()!.users![userIndex].shifts[shiftIndex] };
    if (this.loggedUser.role === 'Master' && this.isPassedTime(selectedProposal.proposalDate)) {
      return;
    }

    if (selectedProposal.from === null) {
      selectedProposal.from = '11:00';
    }

    if (selectedProposal.to === null) {
      selectedProposal.to = this.isFridayOrSaturday(selectedProposal.proposalDate) ? '23:00' : '22:00'
    }

    this.proposalsService.setIndexes(userIndex, shiftIndex);
    this.proposalsService.setSelectedProposal(selectedProposal);
    this.dialog.open(UpdateProposalComponent, { disableClose: false });
  }


  isUnsavedPassedCard() {
    let today = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    let day = new Date(parseInt(this.planCard()!.monthYear.substring(2, 6)), parseInt(this.planCard()!.monthYear.substring(0, 2)) - 1, 1);
    if (day >= today) {
      return false;
    }

    if (this.planCard()!.users?.length > 0) {
      return false;
    }
    this.unsavedProposalCardErrorText = `Rozpis směn pro ${this.planCard()?.monthYearName.toLowerCase()} není uložen.`;
    return true;
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
    if (this.planCard()?.users) {
      if (window.innerHeight < 700) {
        this.bodyStyles.set({
          'maxHeight': '500px',
          'overflow-y': 'auto'
        });
      } else if (window.innerHeight > 700 && window.innerHeight < 920) {
        if (this.planCard() && this.planCard()!.users.length > 16) {
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