import { PartialStateUpdater } from "@ngrx/signals";
import { WarehouseSlice } from "./warehouse.slice";
import { WarehouseCard } from "../../models/warehouse/warehouse-card.interface";

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