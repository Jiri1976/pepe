import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Response } from '../models/response.interface';
import { map, tap } from "rxjs";
import { ProposalCard } from "../models/proposals/proposalCard.interface";
import { ProposalShift } from "../models/proposals/proposalShift.interface";
import { ProposalUser } from "../models/proposals/proposalUser.interface";
import { ToasterService } from "./toaster.service";
import { AuthStore } from "../stores/auth-store/auth.store";

@Injectable({
    providedIn: 'root'
})
export class ProposalsService {
    readonly authStore = inject(AuthStore);
    private MONTHS_NAMES = ["LED", "ÚNO", "BŘE", "DUB", "KVĚ", "ČER", "ČRV", "SRP", "ZÁŘ", "ŘÍJ", "LIS", "PRO"];
    private http = inject(HttpClient);
    private destroyRef = inject(DestroyRef);
    private toaster = inject(ToasterService);
    private BASE_ROUTE = environment.PROPOSALS_PATH;

    destination = signal<string>('F-M');
    monthYear = signal<string>((new Date().getMonth() + 1).toString() + (new Date().getFullYear()).toString());
    selectedProposal = signal<ProposalShift | null>(null);
    isProposalLoading = signal(false);
    nothingChanged = signal(true);
    calendarTitle = signal<string>(this.MONTHS_NAMES[new Date().getMonth()] + ' ' + new Date().getFullYear().toString().substring(2));
    isSaving = signal(false);
    updateHub = signal(false);
    schedules = signal<ProposalCard[]>([]);
    days = signal<number[]>(new Array(0));
    selectedUserIndex = signal<number>(0);
    selectedShiftIndex = signal<number>(0);
    uploadedSchedules = structuredClone(this.schedules());

    getProposalsOverview() {
        const url = this.BASE_ROUTE + `GetProposalsOverview`;
        return this.http.get<Response>(url);
    }

    deleteProposalCard() {
        let httpOptions = {
            headers: new HttpHeaders({
                'user-role': this.authStore.user()?.role!,
            })
        };
        const url = this.BASE_ROUTE + `DeleteProposalCard?monthYear=${this.schedules().find(c => c.destination === this.destination())!.monthYear}&destination=${this.schedules().find(c => c.destination === this.destination())!.destination}`;
        return this.http.delete<Response>(url, httpOptions);
    }

    onSave() {
        this.updateShiftListOrders();
        const subscription = this.saveProposals().pipe(
            tap(response => {
                if (response === null) {
                    this.isSaving.set(false);
                    this.toaster.error('Něco se pokazilo, zkus to znovu.');
                } else if (response.isSuccess === false) {
                    this.isSaving.set(false);
                    this.toaster.error(response.errorMessage);
                } else {
                    this.toaster.success('Úspěšně uloženo!');
                    this.schedules.set(response.result);
                    this.uploadedSchedules = structuredClone(this.schedules());
                    this.nothingChanged.set(true);
                    // this.updateHub.set(true);
                    this.isSaving.set(false);
                }
            })
        ).subscribe({
            error: () => {
                this.isSaving?.set(false);
                this.isProposalLoading?.set(false);
            }
        });

        this.destroyRef.onDestroy(() => {
            subscription.unsubscribe();
        });
    }

    onDelete() {
        this.isProposalLoading.set(true);
        const subscription = this.deleteProposalCard().pipe(
            map(response => {
                if (response === null) {
                    this.isProposalLoading.set(false);
                    this.toaster.error('Něco se pokazilo, zkus to znovu.');
                } else if (response.isSuccess === false) {
                    this.isProposalLoading.set(false);
                    this.toaster.error(response.errorMessage);
                } else if (response.isSuccess) {
                    this.toaster.success(`Směny byly odstraněny!`);
                    let cards = [...this.schedules()];
                    let _card = cards.find(c => c.destination === this.destination());
                    _card = response.result;
                    this.schedules.set(cards);
                    this.isProposalLoading.set(false);
                }
            }),
        ).subscribe({
            next: () => { },
            error: () => {
                this.isSaving?.set(false);
                this.isProposalLoading?.set(false);
            }
        });

        this.destroyRef.onDestroy(() => {
            subscription.unsubscribe();
        });
    }

    uploadSchedulesShifts() {
        this.isProposalLoading.set(true);
        const subscription = this.getScheduledShifts().pipe(
            map(response => {
                if (response === null) {
                    this.isProposalLoading.set(false);
                    this.toaster.error('Něco se pokazilo, zkus to znovu.');
                } else if (response.isSuccess === false) {
                    this.isProposalLoading.set(false);
                    this.toaster.error(response.errorMessage);
                } else if (response.isSuccess) {
                    const card = response.result.find((c: ProposalCard) => c.destination === this.destination());
                    this.days.set(new Array(card.countOfDays));
                    this.schedules.set(response.result);
                    this.uploadedSchedules = structuredClone(this.schedules());
                    this.nothingChanged.set(true);
                    this.isProposalLoading.set(false);
                }
            }),
        ).subscribe({
            next: () => { },
            error: () => {
                this.isSaving?.set(false);
                this.isProposalLoading?.set(false);
            }
        });

        this.destroyRef.onDestroy(() => {
            subscription.unsubscribe();
        });
    }

    addFromInactive(inactiveUser: ProposalUser, index: number) {
        let inactiveUsers = [...this.schedules().find(c => c.destination === this.destination())!.inactiveUsers];
        let users = [...this.schedules().find(c => c.destination === this.destination())!.users];
        if (inactiveUsers.length === 0) {
            return;
        }
        if (users.length === 0) {
            return;
        }
        let _cards = [...this.schedules()];
        let nextCard = _cards.find(c => c.destination !== this.destination());
        const sameUser = nextCard!.users.find(u => u.id === inactiveUser.id && u.position === inactiveUser.position);

        users[0].shifts.forEach((shift, index) => {
            inactiveUser.shifts.push({
                destination: shift.destination,
                from: sameUser && sameUser!.shifts[index].from !== null ? sameUser!.shifts[index].destination : null,
                id: 0,
                listOrder: users.length + 1,
                monthYear: shift.monthYear,
                position: inactiveUser.position,
                proposalDate: shift.proposalDate,
                to: sameUser && sameUser!.shifts[index].to !== null ? sameUser!.shifts[index].to : null,
                userId: inactiveUser.id,
                userName: inactiveUser.name,
                userSurname: inactiveUser.surname
            });
        });

        users.push(inactiveUser);
        inactiveUsers.splice(index, 1);
        let cards = [...this.schedules()];
        let card = cards.find(c => c.destination === this.destination());
        card!.inactiveUsers = inactiveUsers;
        card!.users = users;
        this.schedules.set(cards);
        this.uploadedSchedules = structuredClone(this.schedules());
        this.nothingChanged.set(false);
    }

    removeFromActive(activeUser: ProposalUser, index: number) {
        const inactiveUsers = [...this.schedules().find(c => c.destination === this.destination())!.inactiveUsers];
        const users = [...this.schedules().find(c => c.destination === this.destination())!.users];
        activeUser.shifts = [];
        inactiveUsers.push(activeUser);
        users.splice(index, 1);
        let _cards = [...this.schedules()];
        let _card = _cards.find(c => c.destination === this.destination());
        _card!.users = users;
        _card!.inactiveUsers = inactiveUsers;
        this.schedules.set(_cards);
        this.uploadedSchedules = structuredClone(this.schedules());
        this.nothingChanged.set(false);
    }

    setSelectedProposal(proposal: ProposalShift) {
        this.selectedProposal.set(proposal);
    }

    setIndexes(userIndex: number, shiftIndex: number) {
        this.selectedUserIndex.set(userIndex);
        this.selectedShiftIndex.set(shiftIndex);
    }

    uploadPDF(card: ProposalCard, role: string) {
        const url = this.BASE_ROUTE + 'GenerateProposalPDF';

        return this.http.post<Response>(url, card, {
            headers: new HttpHeaders()
                .set('Content-Type', 'application/json')
                .set('user-role', role)
        });
    }

    resetCalendars() {
        this.calendarTitle.set(this.MONTHS_NAMES[new Date().getMonth()] + ' ' + new Date().getFullYear().toString().substring(2));
        this.monthYear.set((new Date().getMonth() + 1).toString() + (new Date().getFullYear()).toString());
    }

    getScheduledShifts() {
        let httpOptions = {
            headers: new HttpHeaders({
                'user-role': this.authStore.user()?.role!,
            })
        }
        if (this.monthYear().length === 5) {
            this.monthYear.set('0' + this.monthYear());
        }
        const url = this.BASE_ROUTE + `GetScheduledShifts?monthYear=${this.monthYear()}&destination=${this.destination()}`;
        return this.http.get<Response>(url, httpOptions);
    }

    checkNothingChanged() {
        let nothingChanged = true;
        this.uploadedSchedules.forEach((card) => {
            let currentCard = this.schedules().find(c => c.destination === card.destination)!;
            for (let i = 0; i < card.users?.length; i++) {
                if (card.users[i].id !== currentCard.users[i].id) {
                    nothingChanged = false;
                } else {
                    for (let j = 0; j < card.users[i]?.shifts?.length; j++) {
                        if ((card.users[i]?.shifts[j]?.from !== currentCard.users[i]?.shifts[j]?.from) || (card.users[i]?.shifts[j]?.to !== currentCard.users[i]?.shifts[j]?.to)) {
                            nothingChanged = false;
                        }
                    }
                }
            }
        });
        this.nothingChanged.set(nothingChanged);
    }

    updatePositions(currentIndex: number, targetIndex: number) {
        let cards = [...this.schedules()];
        let card = cards.find(c => c.destination === this.destination());
        const users = [...card!.users];
        const user = users.splice(currentIndex, 1)[0];
        const insertAt = targetIndex === currentIndex ? targetIndex + 1 : targetIndex;
        users.splice(insertAt, 0, user);
        card!.users = users;
        this.schedules.set(cards);
        this.checkNothingChanged();
    }

    updateSchedulesAndCheckChanges(cards: ProposalCard[]) {
        this.schedules.set(cards);
        this.checkNothingChanged();
    }

    collideShifts(inputShiftFrom: string, inputShiftTo: string, timeFrom: string, timeTo: string) {
        timeFrom = timeFrom === 'OVA' || timeFrom === 'F-M' ? '11:00' : timeFrom;
        if (inputShiftFrom === '11:00' && (inputShiftTo === '22:00' || inputShiftTo === '23:00')) {
            return true;
        }

        if (inputShiftFrom === timeFrom && inputShiftTo === timeTo) {
            return true;
        }

        const inputFrom = parseFloat(inputShiftFrom.replace(':', ''));
        const inputTo = parseFloat(inputShiftTo.replace(':', ''));
        const listedFrom = parseFloat(timeFrom.replace(':', ''));
        const listedTo = parseFloat(timeTo.replace(':', ''));

        if ((listedFrom > inputFrom && listedFrom < inputTo) || (listedTo > inputFrom && listedTo < inputTo) || (inputFrom >= listedFrom && inputTo <= listedTo)) {
            return true;
        }
        return false;
    }

    private updateShiftListOrders() {
        let cards = [...this.schedules()];
        let card = cards.find(c => c.destination === this.destination());
        card?.users.forEach((user, i) => {
            user.shifts.forEach(shift => {
                shift.listOrder = i;
            });
        });
        this.schedules.set(cards);
    }

    private saveProposals() {
        const url = this.BASE_ROUTE + `CreateUpdate`;
        return this.http.post<Response>(url, this.schedules());
    }
}