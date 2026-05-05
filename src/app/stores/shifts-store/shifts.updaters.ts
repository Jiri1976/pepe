import { PartialStateUpdater } from "@ngrx/signals";
import { ShiftsSlice } from "./shifts.slice";
import { Shift, ShiftCard, UniqueUser } from "../../models/shifts.interface";
import { isFridayOrSaturday } from "../../helpers/common-functions.helper";

export function setSelectedCardPosition(position: string): PartialStateUpdater<ShiftsSlice> {
    return _ => ({
        selectedCardPosition: position
    });
}

export function setSlideIndexAndPosition(sliceIndex: number, uniqueUsers: UniqueUser[]): PartialStateUpdater<ShiftsSlice> {
    return _ => ({
        selectedCardPosition: uniqueUsers[sliceIndex].cards[0].userPosition,
        sliceIndex
    });
}

export function updateParticularCard(cardId: number, newCard: ShiftCard): PartialStateUpdater<ShiftsSlice> {
    return state => {
        let _cards = [...state.cards]
        _cards.map(card => {
            if (card.id === cardId) {
                card = newCard
            }
        });

        return {
            cards: _cards
        }
    }
}

export function setSelectedShift(selectedShift: Shift, isPassedCard: boolean, monthYear: string): PartialStateUpdater<ShiftsSlice> {
    return _ => {
        if (selectedShift.id > 0) {
            return { selectedShift };
        }
        if (isPassedCard) {
            selectedShift.date = `01.${monthYear.substring(0, 2)}.${monthYear.substring(2, 6)}`;
            selectedShift.to = isFridayOrSaturday(selectedShift.date) ? '23:00' : '22:00';
        } else {
            let day = new Date().getDate() < 10 ? '0' + new Date().getDate() : (new Date().getDate()).toString();
            selectedShift.date = `${day}.${monthYear.substring(0, 2)}.${monthYear.substring(2, 6)}`;
            selectedShift.to = isFridayOrSaturday(selectedShift.date) ? '23:00' : '22:00';
        }
        return { selectedShift };
    };
}

export function updateCard(updatedCard: ShiftCard): PartialStateUpdater<ShiftsSlice> {
    return state => {
        return {
            ...state,
            cards: state.cards.map(c =>
                c.userPosition === updatedCard.userPosition &&
                    c.userId === updatedCard.userId &&
                    c.monthYear === updatedCard.monthYear &&
                    c.destination === updatedCard.destination
                    ? updatedCard : c
            )
        }
    };
}

export function deleteShift(shiftId: number, currentCard: ShiftCard): PartialStateUpdater<ShiftsSlice> {
    return state => ({
        ...state,
        cards: state.cards.map(c => {
            if (
                c.userId === currentCard.userId &&
                c.userPosition === currentCard.userPosition &&
                c.monthYear === currentCard.monthYear &&
                c.destination === currentCard.destination
            ) {
                return {
                    ...c,
                    shifts: c.shifts.filter(s => s.id !== shiftId)
                };
            }
            return c;
        })
    });
}