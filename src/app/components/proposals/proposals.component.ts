import { Component, computed, inject, signal } from '@angular/core';
import { ProposalsService } from '../../services/proposals.service';
import { AuthService } from '../../services/auth.service';
import { ProposalButtonComponent } from "./proposla-button/proposal-button.component";
import { UpdateProposalComponent } from "./update-proposal/update-proposal.component";
import { CustomProposalButtonComponent } from "./custom-proposal-button/custom-proposal-button.component";
import { PageAnimation } from '../../animations/page.animation';
import { ProposalSkeletonComponent } from "./proposal-skeleton/proposal-skeleton.component";

@Component({
  selector: 'app-proposals',
  imports: [
    ProposalButtonComponent,
    UpdateProposalComponent,
    CustomProposalButtonComponent,
    ProposalSkeletonComponent
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
  assignments = computed(() => this.proposalsService.assignments());
  monthYear = computed(() => this.proposalsService.monthYear());
  updateVisible = signal(false);
  cookCount = computed(() => this.proposalsService.cookCount());

  ngOnInit(): void {
    this.proposalsService.uploadProposals();
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
    let assignment: any = this.assignments()[x][y];
    let proposal = { name: assignment[0].name, x: x, y: y, date: date, user: user, from: assignment[0].from, to: assignment[0].to, delete: false };
    if (proposal.from === 'OVA' || proposal.from === 'F-M') {
      proposal.delete = true;
      proposal.to = this.isFridayOrSaturday(date) ? '23:00' : '22:00';
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
    this.proposalsService.setSelectedProposal(proposal);
    this.proposalsService.setTime(proposal);
    this.updateVisible.set(true);
  }
}