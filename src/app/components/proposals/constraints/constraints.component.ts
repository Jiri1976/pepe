import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { ProposalStore } from '../../../stores/proposal-store/proposal.store';
import { UserConstraintComponent } from './user-constraint/user-constraint.component';
import { ConstraintSkeletonComponent } from './constraint-skeleton/constraint-skeleton.component';

@Component({
  selector: 'app-constraints',
  imports: [UserConstraintComponent, ConstraintSkeletonComponent],
  templateUrl: './constraints.component.html',
  styleUrls: ['./constraints.component.scss'],
})
export class ConstraintsComponent implements OnInit, AfterViewInit {
  readonly propStore = inject(ProposalStore);
  scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');
  isBubbling = signal(false);
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

  generate() {
    if (this.propStore.invalidScheduleGeneratorRequest()) {
      return;
    }

    this.isBubbling.set(true);

    setTimeout(() => {
      this.isBubbling.set(false);
      this.propStore.setMonthYearScheduleGeneratorRequest();
      this.propStore.requestGenerateSchedule();
    }, 300);
  }

  save() {
    if (this.propStore.invalidScheduleGeneratorRequest()) {
      return;
    }

    this.propStore.requestSaveGenerator();
  }
}
