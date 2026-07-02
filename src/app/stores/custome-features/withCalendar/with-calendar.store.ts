import { signalStore } from '@ngrx/signals';
import { withCalendar } from './with-calendar.feature';

export const CalendarStore = signalStore(
  {
    providedIn: 'root',
  },
  withCalendar(),
);
