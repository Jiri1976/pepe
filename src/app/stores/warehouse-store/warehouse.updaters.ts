import { PartialStateUpdater } from "@ngrx/signals";
import { WarehouseSlice } from "./warehouse.slice";
import { WarehouseCard } from "../../models/warehouses.interface";

export function updateCards(updatedCard: WarehouseCard): PartialStateUpdater<WarehouseSlice> {
    return state => {
        return {
            cards: state.cards.map(card => {
                if (card.warehouseItemId !== updatedCard.warehouseItemId) {
                    return card;
                }

                return {
                    ...card,
                    units: updatedCard.units
                };
            }),
        };
    };
}

export function signalUpdate(updatedCard: WarehouseCard): PartialStateUpdater<WarehouseSlice> {
    return state => {
        let cards = [...state.cards];

        const cardIndex = cards.findIndex(card => card.warehouseItemId === updatedCard.warehouseItemId && card.destination === updatedCard.destination);


        if (cardIndex === -1) {
            return state;
        }

        cards[cardIndex] = {
            ...cards[cardIndex],
            units: updatedCard.units
        };

        return {
            ...state,
            cards
        };
    };
}