import { inject, Injectable, signal } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Response } from '../models/response.interface';
import { GetUser } from "../models/users/getUser.interface";
import { Shift } from "../models/shifts/shift.interface";
import { InitShift } from "../models/shifts/initShift.interface";
import { ShiftCard } from "../models/shifts/shiftCard.interface";
import { UniqueUser } from "../models/shifts/uniqueUser.interface";
import { AuthStore } from "../stores/auth-store/auth.store";

@Injectable({
    providedIn: 'root'
})
export class ShiftService {
    readonly authStore = inject(AuthStore);
    private http = inject(HttpClient);
    private BASE_ROUTE = environment.SHIFTS_PATH;
    private initialShift: InitShift = {
        id: 0,
        date: new Date(),
        from: new Date(),
        to: new Date(),
        perso: '',
        position: '',
        destination: ''
    };
    // monthYear = signal<string>('');
    selectedShift = signal<InitShift>(this.initialShift);
    cardShiftMonthYear = signal<string>('');
    selectedUserId = signal<number>(-1);
    selectedCard = signal<ShiftCard | null>(null);
    uniqueUsers = signal<UniqueUser[]>([]);
    pdfCards = signal<ShiftCard[]>([]);

    setMonthYear(monthYear: string) {
        //this.monthYear.set(monthYear);
    }

    setSelectedShift(shift: Shift) {
        let date = new Date(parseInt(shift.date.split('.')[2]), parseInt(shift.date.split('.')[1]) - 1, parseInt(shift.date.split('.')[0]));
        let from = new Date(parseInt(shift.date.split('.')[2]), parseInt(shift.date.split('.')[1]) - 1, parseInt(shift.date.split('.')[0]), parseInt(shift.from?.split(':')[0]!), parseInt(shift.from?.split(':')[1]!));
        let to = new Date(parseInt(shift.date.split('.')[2]), parseInt(shift.date.split('.')[1]) - 1, parseInt(shift.date.split('.')[0]), parseInt(shift.to?.split(':')[0]!), parseInt(shift.to?.split(':')[1]!));
        let initShift: InitShift = {
            id: shift.id,
            date: date,
            from: from,
            to: to,
            perso: shift.perso ? shift.perso : '',
            position: shift.position,
            destination: shift.destination,
            createdAt: shift.createdAt,
            createdBy: shift.createdBy,
            updatedAt: shift.updatedAt,
            updatedBy: shift.updatedBy
        }
        this.selectedShift.set(initShift);
    }

    getUserShiftCard(monthYear: string, user: GetUser) {
        let data = {
            monthYear: monthYear,
            user: {
                id: user.id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                role: user.role,
                position: user.position,
                destination: user.destination,
                nick: user.nick,
                isActive: user.isActive
            }
        }
        this.cardShiftMonthYear.set(monthYear);
        const url = this.BASE_ROUTE + `GetUserShiftCard`;
        return this.http.post<Response>(url, data);
    }

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

    generatePDF(card: ShiftCard, destination: string) {
        const role = this.authStore.user()?.role;
        const url = this.BASE_ROUTE + 'GeneratePDFCard';

        return this.http.post<Response>(url, card, {
            headers: new HttpHeaders()
                .set('Content-Type', 'application/json')
                .set('user-role', role!)
                .set('destination', destination)
        });
    }

    checkAllToPdf() {
        this.pdfCards.set([]);
        let _pdfCards: ShiftCard[] = [];
        this.uniqueUsers().forEach(user => {
            user.cards.forEach(card => {
                if (card.id > 0 && card.shifts.length > 0) {
                    _pdfCards.push(card);
                }
            });
        });
        this.pdfCards.set(_pdfCards);
    }

    generateAllToPDF(cards: ShiftCard[], destination: string) {
        const role = this.authStore.user()?.role;
        const url = this.BASE_ROUTE + 'generateAllToPDF';

        return this.http.post<Response>(url, cards, {
            headers: new HttpHeaders()
                .set('Content-Type', 'application/json')
                .set('user-role', role!)
                .set('destination', destination)
        });
    }
}