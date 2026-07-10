import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Response } from '../models/response.interface';
import { Shift, ShiftCard } from '../models/shifts.interface';
import { AuthStore } from '../stores/auth-store/auth.store';

@Service()
export class ShiftService {
  readonly authStore = inject(AuthStore);
  private http = inject(HttpClient);
  private BASE_ROUTE = environment.SHIFTS_PATH;

  createUpdateShift(shift: Shift) {
    const url = this.BASE_ROUTE + `CreateUpdateShift`;
    return this.http.post<Response>(url, shift);
  }

  createUpdateDailyShift(shift: Shift) {
    const url = this.BASE_ROUTE + `CreateUpdateDailyShift`;
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
    const url =
      this.BASE_ROUTE +
      `GetUsersShiftCards?monthYear=${monthYear}&destination=${destination}`;
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

  getShiftsForToday(destination: string) {
    const url = `${this.BASE_ROUTE}GetShiftsForToday?destination=${destination}`;
    return this.http.get<Response>(url);
  }

  deleteDailyShift(shift: Shift) {
    const url = `${this.BASE_ROUTE}DeleteDailyShift`;
    return this.http.post<Response>(url, shift);
  }
}
