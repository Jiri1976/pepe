import {
  Component,
  computed,
  effect,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ShiftsStore } from '../../../stores/shifts-store/shifts.store';
import { todayDate } from '../../../helpers/common-functions.helper';
import { DailyItemComponent } from '../daily-item/daily-item.component';
import { DailySkeletonComponent } from './daily-skeleton/daily-skeleton.component';

@Component({
  selector: 'app-daily',
  imports: [DailyItemComponent, DailySkeletonComponent],
  templateUrl: './daily.component.html',
  styleUrl: './daily.component.scss',
})
export class DailyComponent implements OnInit {
  readonly shiftsStore = inject(ShiftsStore);
  todayDate = todayDate();
  height = signal<number>(window.innerHeight);
  dailyShiftsCount = this.shiftsStore.dailyShiftsCount;
  shifts = computed(() => this.shiftsStore.todaysShifts.shifts());

  @HostListener('window:resize')
  onWindowResize() {
    this.height.set(window.innerHeight);
  }

  ngOnInit() {
    this.shiftsStore.getShiftsForToday();
  }

  bodyStyles = computed(() => {
    if (this.dailyShiftsCount() > 1) {
      if (this.height() < 700) {
        return {
          maxHeight: '450px',
          'overflow-y': 'auto',
        };
      } else if (this.height() > 700 && this.height() < 920) {
        if (this.dailyShiftsCount() > 7) {
          return {
            maxHeight: '480px',
            'overflow-y': 'auto',
          };
        } else {
          return {
            maxHeight: '',
            'overflow-y': 'hidden',
          };
        }
      } else {
        return {
          maxHeight: '',
          'overflow-y': 'hidden',
        };
      }
    } else {
      return {
        maxHeight: '',
        'overflow-y': 'hidden',
      };
    }
  });
}
