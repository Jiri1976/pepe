import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Response } from '../models/response.interface';
import { Shift } from "../models/shifts/shift.interface";
import { ShiftCard } from "../models/shifts/shiftCard.interface";
import { AuthStore } from "../stores/auth-store/auth.store";

@Injectable({
    providedIn: 'root'
})
export class ShiftService {
    readonly authStore = inject(AuthStore);
    private http = inject(HttpClient);
    private BASE_ROUTE = environment.SHIFTS_PATH;

    //  getUserShiftCard(monthYear: string, user: User) {
    //     let data = {
    //         monthYear: monthYear,
    //         user: {
    //             id: user.id,
    //             name: user.name,
    //             surname: user.surname,
    //             email: user.email,
    //             role: user.role,
    //             position: user.position,
    //             destination: user.destination,
    //             nick: user.nick,
    //             isActive: user.isActive
    //         }
    //     }       
    //     const url = this.BASE_ROUTE + `GetUserShiftCard`;
    //     return this.http.post<Response>(url, data);
    // }

    createUpdateShift(shift: Shift) {
        const url = this.BASE_ROUTE + `CreateUpdateShift`;
        return this.http.post<Response>(url, shift);
    }

    deleteShift(shiftId: number) {
        const url = this.BASE_ROUTE + `DeleteShift?id=${shiftId}`;
        return this.http.delete<Response>(url);
    }

    deleteShiftCard(cardId: number) {
        const url = this.BASE_ROUTE + `DeleteCard?id=${cardId}`;
        return this.http.delete<Response>(url);
    }

    getUsersShiftCards(monthYear: string, destination: string) {
        const url = this.BASE_ROUTE + `GetUsersShiftCards?monthYear=${monthYear}&destination=${destination}`;
        return this.http.get<Response>(url);
    }

    generatePDF(card: ShiftCard) {
        const url = this.BASE_ROUTE + 'GeneratePDFCard';
        return this.http.post<Response>(url, card);
    }

    generateAllToPDF(cards: ShiftCard[]) {
        const url = this.BASE_ROUTE + 'generateAllToPDF';
        return this.http.post<Response>(url, cards);
    }
}