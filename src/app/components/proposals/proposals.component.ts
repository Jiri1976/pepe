import { Component, computed, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { ProposalsService } from '../../services/proposals.service';
import { ProposalSkeletonComponent } from "./proposal-skeleton/proposal-skeleton.component";
import { CdkDrag, CdkDragHandle, CdkDragPlaceholder, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
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
  dashboard = viewChild.required<ElementRef>('dashboard');
  proposalsService = inject(ProposalsService);
  height = signal<number>(window.innerHeight);

  @HostListener('window:resize')
  onWindowResize() {
    this.height.set(window.innerHeight);
  }

  bodyStyles = computed(() => {
    if (this.propStore.currentCard()?.users) {
      if (this.height() < 700) {
        return {
          'maxHeight': '500px',
          'overflow-y': 'auto'
        };
      } else if (this.height() > 700 && this.height() < 920) {
        if (this.propStore.currentCard() && this.propStore.currentCard()!.users.length > 13) {
          return {
            'maxHeight': '580px',
            'overflow-y': 'auto'
          };
        } else {
          return {
            'maxHeight': '',
            'overflow-y': 'hidden'
          };
        }
      } else {
        return {
          'maxHeight': '',
          'overflow-y': 'hidden'
        };
      }
    } else {
      return {
        'maxHeight': '',
        'overflow-y': 'hidden'
      };
    }
  });

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

  ngOnInit(): void {
    const user = this.authStore.user();
    if (user?.role === 'Master' && user.destination !== this.propStore.destination()) {
      this.propStore.setDestination(user.destination);
    }
    this.propStore.uploadSchedulesShifts();
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
}
