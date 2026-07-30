import { PartialStateUpdater } from '@ngrx/signals';
import { ShiftsSlice } from './shifts.slice';
import { Shift, ShiftCard, UniqueUser } from '../../models/shifts.interface';
import {
  isFridayOrSaturday,
  todayDate,
} from '../../helpers/common-functions.helper';

export function setSelectedCardPosition(
  position: string,
): PartialStateUpdater<ShiftsSlice> {
  return (_) => ({
    selectedCardPosition: position,
  });
}

export function setSlideIndexAndPosition(
  sliceIndex: number,
  uniqueUsers: UniqueUser[],
): PartialStateUpdater<ShiftsSlice> {
  return (_) => ({
    selectedCardPosition: uniqueUsers[sliceIndex].cards[0].userPosition,
    sliceIndex,
  });
}

export function updateParticularCard(
  cardId: number,
  newCard: ShiftCard,
): PartialStateUpdater<ShiftsSlice> {
  const hasMonthYear = !!newCard.monthYear;
  const hasDestination = !!newCard.destination;

  return (state) => ({
    cards: state.cards.map((card) =>
      (cardId > 0 && card.id === cardId) ||
      (card.userId === newCard.userId &&
        card.userPosition === newCard.userPosition &&
        (!hasMonthYear || card.monthYear === newCard.monthYear) &&
        (!hasDestination || card.destination === newCard.destination))
        ? {
            ...newCard,
            monthYear: newCard.monthYear || card.monthYear,
            destination: newCard.destination || card.destination,
            userId: newCard.userId || card.userId,
            userName: newCard.userName || card.userName,
            userSurname: newCard.userSurname || card.userSurname,
            userPosition: newCard.userPosition || card.userPosition,
            imageUrl: newCard.imageUrl || card.imageUrl,
            shifts: newCard.shifts ?? [],
          }
        : card,
    ),
  });
}

export function setSelectedShift(
  selectedShift: Shift,
  isPassedCard: boolean,
  monthYear: string,
): PartialStateUpdater<ShiftsSlice> {
  return (_) => {
    if (selectedShift.id > 0) {
      return { selectedShift };
    }
    if (isPassedCard) {
      selectedShift.date = `01.${monthYear.substring(0, 2)}.${monthYear.substring(2, 6)}`;
      selectedShift.to = isFridayOrSaturday(selectedShift.date)
        ? '23:00'
        : '22:00';
    } else {
      let day =
        new Date().getDate() < 10
          ? '0' + new Date().getDate()
          : new Date().getDate().toString();
      selectedShift.date = `${day}.${monthYear.substring(0, 2)}.${monthYear.substring(2, 6)}`;
      selectedShift.to = isFridayOrSaturday(selectedShift.date)
        ? '23:00'
        : '22:00';
    }
    return { selectedShift };
  };
}

export function updateCard(
  updatedCard: ShiftCard,
): PartialStateUpdater<ShiftsSlice> {
  return (state) => {
    return {
      ...state,
      cards: state.cards.map((c) =>
        c.userPosition === updatedCard.userPosition &&
        c.userId === updatedCard.userId &&
        c.monthYear === updatedCard.monthYear &&
        c.destination === updatedCard.destination
          ? updatedCard
          : c,
      ),
    };
  };
}

export function deleteShift(
  shiftId: number,
  currentCard: ShiftCard,
): PartialStateUpdater<ShiftsSlice> {
  return (state) => ({
    ...state,
    cards: state.cards.map((c) => {
      if (
        c.userId === currentCard.userId &&
        c.userPosition === currentCard.userPosition &&
        c.monthYear === currentCard.monthYear &&
        c.destination === currentCard.destination
      ) {
        return {
          ...c,
          shifts: c.shifts.filter((s) => s.id !== shiftId),
        };
      }
      return c;
    }),
  });
}

export function addNewDailyShift(): PartialStateUpdater<ShiftsSlice> {
  return (state) => {
    if (state.todaysShifts?.users.length === 0) {
      return state;
    }
    const newShift: Shift = {
      id: 0,
      shiftCardId: 0,
      userId: 0,
      position: '',
      destination: state.destination,
      date: todayDate(),
      from: '11:00',
      to: '22:00',
      hours: '',
      perso: '',
      createdAt: null,
      createdBy: null,
      updatedAt: null,
      updatedBy: null,
      confirmed: undefined,
    };

    let todaysShifts = { ...state.todaysShifts };
    if (todaysShifts?.shifts) {
      todaysShifts.shifts.push(newShift);
    }
    let concurrentErrors = [...state.concurrentErrors];
    concurrentErrors.push('');

    return {
      todaysShifts,
      concurrentErrors,
    };
  };
}

export function removeUnsavedTodaysShifts(
  index: number,
): PartialStateUpdater<ShiftsSlice> {
  return (state) => {
    if (!state.todaysShifts || state.todaysShifts.shifts.length === 0) {
      return state;
    }

    if (index < 0 || index >= state.todaysShifts.shifts.length) {
      return state;
    }

    const shiftToRemove = state.todaysShifts.shifts[index];
    if (!shiftToRemove || shiftToRemove.id !== 0) {
      return state;
    }

    const todaysShifts = {
      ...state.todaysShifts,
      shifts: state.todaysShifts.shifts.filter((_, i) => i !== index),
    };
    const concurrentErrors = state.concurrentErrors.filter(
      (_, i) => i !== index,
    );

    return {
      todaysShifts,
      concurrentErrors,
    };
  };
}

export function updateDailyShiftUserId(
  index: number,
  userId: number,
): PartialStateUpdater<ShiftsSlice> {
  return (state) => {
    if (state.todaysShifts?.shifts.length === 0) {
      return state;
    }

    let todaysShifts = { ...state.todaysShifts };
    const shiftToUpdate = todaysShifts?.shifts[index];
    shiftToUpdate.userId = userId;

    return {
      todaysShifts,
    };
  };
}

export function updateDailyShiftPosition(
  index: number,
  position: string,
): PartialStateUpdater<ShiftsSlice> {
  return (state) => {
    if (state.todaysShifts?.shifts.length === 0) {
      return state;
    }

    let todaysShifts = { ...state.todaysShifts };
    const shiftToUpdate = todaysShifts?.shifts[index];
    shiftToUpdate.position = position;
    return {
      todaysShifts,
    };
  };
}

export function updateDailyShift(
  index: number,
  from: string,
  to: string,
): PartialStateUpdater<ShiftsSlice> {
  return (state) => {
    if (state.todaysShifts?.shifts.length === 0) {
      return state;
    }

    let todaysShifts = { ...state.todaysShifts };
    const shiftToUpdate = todaysShifts?.shifts[index];
    shiftToUpdate.from = from;
    shiftToUpdate.to = to;

    return {
      todaysShifts,
    };
  };
}

export function updateConcurrentErrors(
  index: number,
): PartialStateUpdater<ShiftsSlice> {
  return (state) => {
    if (state.todaysShifts?.shifts.length === 0) {
      return state;
    }

    let concurrentErrors = [...state.concurrentErrors];
    concurrentErrors[index] = 'Směny se překrývají';

    return {
      concurrentErrors,
    };
  };
}

export function clearConcurrentErrors(): PartialStateUpdater<ShiftsSlice> {
  return (state) => {
    if (state.todaysShifts?.shifts.length === 0) {
      return state;
    }

    let concurrentErrors = [...state.concurrentErrors];
    let cleanErrors: string[] = [];
    concurrentErrors.forEach((err) => {
      cleanErrors.push('');
    });

    return {
      concurrentErrors: cleanErrors,
    };
  };
}
