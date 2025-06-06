import { inject, Injectable, signal } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Response } from '../models/response.interface';
import { GetUserDTO } from "../models/users/getUserDTO.interface";
import { Shift } from "../models/shifts/shift.interface";
import { InitShift } from "../models/shifts/initShift.interface";
import { AuthService } from "./auth.service";
import { ShiftCard } from "../models/shifts/shiftCard.interface";

@Injectable({
    providedIn: 'root'
})
export class ShiftService {
    private http = inject(HttpClient);
    private BASE_ROUTE = environment.SHIFTS_PATH;
    private initialShift: InitShift = {
        id: 0,
        date: new Date(),
        from: new Date(),
        to: new Date(),
        perso: ''
    };
    private authService = inject(AuthService);
    monthYear = signal<string>('');
    selectedShift = signal<InitShift>(this.initialShift);
    cardShiftMonthYear = signal<string>('');
    shiftFormVisible = signal(false);

    setMonthYear(monthYear: string) {
        this.monthYear.set(monthYear);
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
            perso: shift.perso ? shift.perso : ''
        }
        this.selectedShift.set(initShift);
    }

    getUserShiftCard(monthYear: string, user: GetUserDTO) {
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
        const url = this.BASE_ROUTE + `shifts/GetUserShiftCard`;
        return this.http.post<Response>(url, data);
    }

    createUpdateShift(shift: Shift) {
        const url = this.BASE_ROUTE + `shifts/CreateUpdateShift`;
        return this.http.post<Response>(url, shift);
    }

    deleteShift(shiftId: number) {
        const url = this.BASE_ROUTE + `shifts/DeleteShift?id=${shiftId}`;
        return this.http.delete<Response>(url);
    }

    deleteShiftCard(cardId: number) {
        const url = this.BASE_ROUTE + `shifts/DeleteCard?id=${cardId}`;
        return this.http.delete<Response>(url);
    }

    getUsersShiftCards(monthYear: string, destination: string) {
        const url = this.BASE_ROUTE + 'shifts/GetUsersShiftCards';
        const model = {
            monthYear,
            destination
        }
        return this.http.post<Response>(url, model);
    }

    generatePDF(card: ShiftCard, destination: string) {
        const role = this.authService.getUser().role;
        const url = this.BASE_ROUTE + 'shifts/GeneratePDFCard';

        return this.http.post<Response>(url, card, {
            headers: new HttpHeaders()
                .set('Content-Type', 'application/json')
                .set('user-role', role)
                .set('destination', destination)
        });
    }

    generateAllToPDF(cards: ShiftCard[], destination: string) {
        const role = this.authService.getUser().role;
        const url = this.BASE_ROUTE + 'shifts/generateAllToPDF';

        return this.http.post<Response>(url, cards, {
            headers: new HttpHeaders()
                .set('Content-Type', 'application/json')
                .set('user-role', role)
                .set('destination', destination)
        });
    }
}