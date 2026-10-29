import {
  Component,
  computed,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { ProposalSkeletonComponent } from './proposal-skeleton/proposal-skeleton.component';
import { ProposalShiftComponent } from './proposal-shift/proposal-shift.component';
import { AuthStore } from '../../stores/auth-store/auth.store';
import { ProposalStore } from '../../stores/proposal-store/proposal.store';
import { ProposalUser, ProposalShift } from '../../models/proposals.interface';
import { ProposalPitComponent } from './proposal-pit/proposal-pit.component';
import { TableModule } from 'primeng/table';
import { Bars } from '@primeicons/angular/bars';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-proposals',
  imports: [
    TableModule,
    ProposalSkeletonComponent,
    Bars,
    TagModule,
    ProposalPitComponent,
    ProposalShiftComponent,
  ],
  templateUrl: './proposals.component.html',
  styleUrls: ['./proposals.component.scss'],
})
export class ProposalsComponent {
  readonly authStore = inject(AuthStore);
  readonly propStore = inject(ProposalStore);
  height = signal<number>(window.innerHeight);
  tableWidth = computed(() => {
    const shifts = this.propStore.currentCard()?.users?.[0]?.shifts ?? [];
    const isEditable = !this.propStore.isPassedCard();
    const hasReorderColumn =
      isEditable && this.authStore.user()?.role === 'Admin';
    const fixedWidth =
      150 + (hasReorderColumn ? 35 : 0) + (isEditable ? 35 : 0);
    return `${fixedWidth + shifts.length * 35}px`;
  });
  tableUsers = computed(() => [...(this.propStore.currentCard()?.users ?? [])]);

  @HostListener('window:resize')
  onWindowResize() {
    this.height.set(window.innerHeight);
  }

  scrollHeight = computed(() => {
    if (this.propStore.currentCard()?.users) {
      if (this.height() < 700) {
        return '500px';
      } else if (this.height() > 700 && this.height() < 920) {
        if (
          this.propStore.currentCard() &&
          this.propStore.currentCard()!.users.length > 13
        ) {
          return '580px';
        } else {
          return '';
        }
      } else {
        return '';
      }
    } else {
      return '';
    }
  });

  readonly warning = computed(() => {
    if (this.propStore.isUnsavedPassedCard()) {
      return `Rozpis směn pro ${this.propStore.currentCard()!.monthYearName.toLowerCase()} není uložen.`;
    } else if (
      this.propStore.currentCard()?.users?.length === 0 &&
      this.propStore.currentCard()?.inactiveUsers?.length === 0
    ) {
      return `Chybí evidovaní pracovníci na pobočce - ${this.propStore.currentCard()?.destination}`;
    } else if (
      this.propStore.currentCard()?.users?.length === 0 &&
      this.propStore.currentCard()!.inactiveUsers!.length > 0
    ) {
      return `Přidej pracovníky z ${this.propStore.currentCard()?.destination} pro ${this.propStore.currentCard()!.monthYearName.toLowerCase()}`;
    }
    return null;
  });

  ngOnInit(): void {
    const user = this.authStore.user();
    if (
      user?.role === 'Master' &&
      user.destination !== this.propStore.destination()
    ) {
      this.propStore.setDestination(user.destination);
    }
    this.propStore.uploadSchedulesShifts();
  }

  remove(user: ProposalUser, index: number) {
    const userShifts = user.shifts.filter(
      (s) =>
        s.from !== null &&
        s.to !== null &&
        s.from !== 'F-M' &&
        s.from !== 'OVA',
    );
    this.propStore.removeFromActive(user, index, userShifts);
  }

  isWeekend(date: string) {
    var day = new Date(
      parseInt(date.split('.')[2]),
      parseInt(date.split('.')[1]) - 1,
      parseInt(date.split('.')[0]),
    );
    if (day.getDay() == 0 || day.getDay() == 5 || day.getDay() == 6) {
      return true;
    }
    return false;
  }

  dayOfWeek(date: string) {
    var day = new Date(
      parseInt(date.split('.')[2]),
      parseInt(date.split('.')[1]) - 1,
      parseInt(date.split('.')[0]),
    );
    let days = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
    return days[day.getDay()];
  }

  onCreateUpdateProposal(selectedProposal: ProposalShift) {
    if (
      this.authStore.user()?.role === 'Master' &&
      this.isPassedTime(selectedProposal.proposalDate)
    ) {
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

  onRowReorder(event: any) {
    this.propStore.updatePositions(event.dragIndex, event.dropIndex);
  }
}
