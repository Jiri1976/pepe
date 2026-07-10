import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  withMethods,
  withState,
} from '@ngrx/signals';
import { CalendarSlice, initialCalendarSlice } from './with-calendar.slice';

export function withCalendar(): SignalStoreFeature<
  { state: {}; props: {}; methods: {} },
  {
    state: CalendarSlice;
    props: {};
    methods: {
      openCalendar: () => void;
      closeCalendar: () => void;
    };
  }
> {
  return signalStoreFeature(
    withState({
      ...initialCalendarSlice,
    }),
    withMethods((store) => {
      return {
        openCalendar: () => patchState(store, { isCalendarOpen: true }),
        closeCalendar: () => patchState(store, { isCalendarOpen: false }),
      };
    }),
  );
}
