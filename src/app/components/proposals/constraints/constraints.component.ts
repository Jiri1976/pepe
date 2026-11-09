import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  viewChild,
} from '@angular/core';
import { ProposalStore } from '../../../stores/proposal-store/proposal.store';
import { UserConstraintComponent } from './user-constraint/user-constraint.component';
import { ConstraintSkeletonComponent } from './constraint-skeleton/constraint-skeleton.component';
import { Dialog } from '@angular/cdk/dialog';
import { ConfirmationComponent } from '../../confirmation/confirmation.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-constraints',
  imports: [UserConstraintComponent, ConstraintSkeletonComponent],
  templateUrl: './constraints.component.html',
  styleUrls: ['./constraints.component.scss'],
})
export class ConstraintsComponent implements OnInit, AfterViewInit {
  private dialog = inject(Dialog);
  readonly propStore = inject(ProposalStore);
  scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  readonly pizza = computed(() =>
    this.propStore
      .currentCard()
      ?.users?.filter((user) => user.position === 'Pizza'),
  );

  readonly helpers = computed(() =>
    this.propStore
      .currentCard()
      ?.users?.filter((user) => user.position === 'Helper'),
  );

  readonly drivers = computed(() =>
    this.propStore
      .currentCard()
      ?.users?.filter((user) => user.position === 'Driver'),
  );

  readonly cooks = computed(() =>
    this.propStore
      .currentCard()
      ?.users?.filter((user) => user.position === 'Cook'),
  );

  ngAfterViewInit(): void {
    const el = this.scrollContainer()?.nativeElement;
    if (el) {
      requestAnimationFrame(() => {
        el.focus({ preventScroll: true });
        el.scrollTop = 0;
      });
    }
  }

  ngOnInit(): void {
    this.propStore.loadConstraints();
  }

  async generate() {
    if (this.propStore.invalidScheduleGeneratorRequest()) {
      return;
    }
    this.propStore.setMonthYearScheduleGeneratorRequest();

    const dialogRef = this.dialog.open<boolean>(ConfirmationComponent, {
      disableClose: false,
      data: { text: 'Opravdu chceš generovat rozvrh?' },
    });
    const result = await firstValueFrom(dialogRef.closed);

    if (result !== true) {
      return;
    }

    this.propStore.generateSchedule();
  }

  async save() {
    if (this.propStore.invalidScheduleGeneratorRequest()) {
      return;
    }
    const dialogRef = this.dialog.open<boolean>(ConfirmationComponent, {
      disableClose: false,
      data: { text: 'Opravdu uložit plánovací podmínky?' },
    });
    const result = await firstValueFrom(dialogRef.closed);

    if (result !== true) {
      return;
    }
    this.propStore.saveGenerator();
  }
}
