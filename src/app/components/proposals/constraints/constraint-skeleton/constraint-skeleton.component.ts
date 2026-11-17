import { Component } from '@angular/core';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-constraint-skeleton',
  imports: [CheckboxModule],
  templateUrl: './constraint-skeleton.component.html',
  styleUrls: ['./constraint-skeleton.component.scss'],
})
export class ConstraintSkeletonComponent {
  readonly weekDays = [1, 2, 3, 4, 5, 6, 7];
  readonly calendarRows = [1, 2, 3, 4, 5, 6];
  readonly calendars = ['free', 'morning', 'afternoon', 'whole-day', 'opposite'];
}
