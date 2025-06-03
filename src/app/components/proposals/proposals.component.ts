
import { Component, computed, inject, signal } from '@angular/core';
import { CdkDragDrop, DragDropModule, transferArrayItem } from '@angular/cdk/drag-drop';
import { HideElementDirective } from '../../directives/hide-element.directive';
import { ProposalsService } from '../../services/proposals.service';
import { AuthService } from '../../services/auth.service';
import { ProposalButtonComponent } from "./proposla-button/proposal-button.component";
import { UpdateProposalComponent } from "./update-proposal/update-proposal.component";
import { CustomProposalButtonComponent } from "./custom-proposal-button/custom-proposal-button.component";
import { PageAnimation } from '../../animations/page.animation';

@Component({
  selector: 'app-proposals',
  imports: [
    DragDropModule,
    HideElementDirective,
    ProposalButtonComponent,
    UpdateProposalComponent,
    CustomProposalButtonComponent
  ],
  templateUrl: './proposals.component.html',
  styleUrl: './proposals.component.scss',
  animations: [
    PageAnimation
  ]
})
export class ProposalsComponent {
  private authService = inject(AuthService);
  proposalsService = inject(ProposalsService);
  loggedUser = this.authService.getUser();
  destination = computed(() => this.proposalsService.destination());
  filteredUsers = computed(() => this.proposalsService.filteredUsers());
  proposalCard = computed(() => this.proposalsService.proposalCard());
  proposalsLoading = computed(() => this.proposalsService.isProposalLoading());
  unsavedProposalCardErrorText = '';
  users = computed(() => this.proposalsService.users());
  shifts = computed(() => this.proposalsService.shifts());
  wShifts = computed(() => this.proposalsService.wShifts());
  mShifts = computed(() => this.proposalsService.mShifts());
  aShifts = computed(() => this.proposalsService.aShifts());
  destShifts = computed(() => this.proposalsService.destShifts());
  assignments = computed(() => this.proposalsService.assignments());
  dropListIds = computed(() => this.proposalsService.dropListIds());
  monthYear = computed(() => this.proposalsService.monthYear());
  updateVisible = signal(false);
  emptyDays = new Array(31);
  emptyUsers = new Array(13);
  cookCount = computed(() => this.proposalsService.cookCount());
  masterAdd = signal(false);

  ngOnInit(): void {
    this.proposalsService.uploadProposals();
  }

  onDrop(event: CdkDragDrop<any[]>, indexes: string) {
    if (
      event.container.data.length > 0 &&
      event.previousContainer !== event.container
    ) {
      return;
    }
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    if (indexes !== '') {
      let assigments = { ...this.assignments() };
      let userId = parseInt(indexes.split('-')[1]);
      let index = parseInt(indexes.split('-')[2]);
      let isFridayOrSaturday = this.isFridayOrSaturday(this.proposalCard().proposalDays[index].date);
      let selectedAssigment: any = assigments[userId][index];
      selectedAssigment[0].name = event.container.data[0].name;
      selectedAssigment[0].from = event.container.data[0].from;
      if (event.container.data[0].name === 'M') {
        selectedAssigment[0].to = '17:00';
      } else if (event.container.data[0].name === 'D') {
        selectedAssigment[0].to = '00:00';
      }
      else {
        selectedAssigment[0].to = isFridayOrSaturday ? '23:00' : '22:00';
      }
      this.proposalsService.updateAssigments(assigments);
    }
    this.proposalsService.setProposals();
  }

  isFridayOrSaturday(date: string) {
    var day = new Date(parseInt(date.split('.')[2]), parseInt(date.split('.')[1]) - 1, parseInt(date.split('.')[0]));
    if (day.getDay() == 5 || day.getDay() == 6) {
      return true;
    }
    return false;
  }

  dayOfWeek(date: string) {
    var day = new Date(parseInt(date.split('.')[2]), parseInt(date.split('.')[1]) - 1, parseInt(date.split('.')[0]));
    let days = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
    return days[day.getDay()];
  }

  onUpdateProposal(x: number, y: number, date: string, user: string) {
    if (this.loggedUser.role === 'Master' && this.isPassedTime(date)) {
      return;
    }
    this.masterAdd.set(false);
    let assignment: any = this.assignments()[x][y];
    let proposal = { name: assignment[0].name, x: x, y: y, date: date, user: user, from: assignment[0].from, to: assignment[0].to, delete: false };
    if (proposal.from === 'OVA' || proposal.from === 'F-M') {
      proposal.delete = true;
    }
    this.proposalsService.setSelectedProposal(proposal);
    this.proposalsService.setTime(proposal);
    this.updateVisible.set(true);
  }

  isUnsavedPassedCard() {
    let today = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    let _monthYear = this.monthYear().length === 5 ? '0' + this.monthYear() : this.monthYear()

    let day = new Date(parseInt(_monthYear.substring(2, 6)), parseInt(_monthYear.substring(0, 2)) - 1, 1);
    if (day >= today) {
      return false;
    }
    let MONTHS_NAMES = ["leden", "únor", "březen", "duben", "květen", "červen", "červenec", "srpen", "září", "říjen", "listopad", "prosinec"];
    this.unsavedProposalCardErrorText = `Rozpis směn pro ${MONTHS_NAMES[parseInt(_monthYear.substring(0, 2)) - 1]} ${_monthYear.substring(2, 6)} není uložen.`;
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

  onAdd(userId: number, index: number, date: string, user: string) {
    let assignment = { ...this.assignments()[userId][index] }
    if (Object.keys(assignment).length > 0 || this.isPassedTime(date)) {
      return;
    }
    let proposal = { name: 'W', x: userId, y: index, date: date, user: user, from: '11:00', to: this.isFridayOrSaturday(date) ? '23:00' : '22:00', delete: false };
    this.masterAdd.set(true);
    this.proposalsService.setSelectedProposal(proposal);
    this.proposalsService.setTime(proposal);
    this.updateVisible.set(true);
  }
}