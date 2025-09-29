import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Response } from '../models/response.interface';
import { AuthService } from "./auth.service";
import { map, tap } from "rxjs";
import { AlertService } from "./alert.service";
import { ProposalCard } from "../models/proposals/proposalCard.interface";
import { ProposalShift } from "../models/proposals/proposalShift.interface";
import { ProposalUser } from "../models/proposals/proposalUser.interface";

@Injectable({
    providedIn: 'root'
})
export class ProposalsService {
    private MONTHS_NAMES = ["LED", "ÚNO", "BŘE", "DUB", "KVĚ", "ČER", "ČRV", "SRP", "ZÁŘ", "ŘÍJ", "LIS", "PRO"];
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private destroyRef = inject(DestroyRef);
    private alertService = inject(AlertService);
    private BASE_ROUTE = environment.SHIFTS_PATH;

    destination = signal<string>('F-M');
    monthYear = signal<string>((new Date().getMonth() + 1).toString() + (new Date().getFullYear()).toString());
    selectedProposal = signal<ProposalShift | null>(null);
    isProposalLoading = signal(false);
    nothingChanged = signal(true);
    calendarTitle = signal<string>(this.MONTHS_NAMES[new Date().getMonth()] + ' ' + new Date().getFullYear().toString().substring(2));
    isSaving = signal(false);
    updateHub = signal(false);

    planCard = signal<ProposalCard | null>(null);
    days = signal<number[]>(new Array(0));
    selectedUserIndex = signal<number>(0);
    selectedShiftIndex = signal<number>(0);
    uploadedCard = structuredClone(this.planCard());

    getProposalsOverview() {
        const url = this.BASE_ROUTE + `Proposals/GetProposalsOverview`;
        return this.http.get<Response>(url);
    }

    deleteProposalCard() {
        let httpOptions = {
            headers: new HttpHeaders({
                'user-role': this.authService.getUser().role,
            })
        };
        const url = this.BASE_ROUTE + `Proposals/DeleteProposalCard?monthYear=${this.planCard()?.monthYear}&destination=${this.planCard()?.destination}`;
        return this.http.delete<Response>(url, httpOptions);
    }

    onSave() {
        this.updateShiftListOrders();
        const subscription = this.saveProposals(this.planCard()!).pipe(
            tap(response => {
                if (response === null) {
                    this.isSaving.set(false);
                    this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
                } else if (response.isSuccess === false) {
                    this.isSaving.set(false);
                    this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
                } else {
                    this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: 'Úspěšně uloženo!' });
                    this.planCard.set(response.result);
                    this.uploadedCard = structuredClone(this.planCard());
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
                    this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
                } else if (response.isSuccess === false) {
                    this.isProposalLoading.set(false);
                    this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
                } else if (response.isSuccess) {
                    this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: `Směny byly odstraněny!` });
                    this.planCard.set(response.result);
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

    uploadProposals() {
        this.isProposalLoading.set(true);
        const subscription = this.getProposalsByMonthAndDestination().pipe(
            map(response => {
                if (response === null) {
                    this.isProposalLoading.set(false);
                    this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
                } else if (response.isSuccess === false) {
                    this.isProposalLoading.set(false);
                    this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
                } else if (response.isSuccess) {
                    this.planCard.set(response.result);
                    this.days.set(new Array(this.planCard()?.countOfDays));
                    this.uploadedCard = structuredClone(this.planCard());
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
        const inactiveUsers = [...this.planCard()!.inactiveUsers];
        if (inactiveUsers.length === 0) {
            return;
        }
        if (this.planCard()?.users.length === 0) {
            return;
        }
        const users = [...this.planCard()!.users];

        users[0].shifts.forEach(shift => {
            inactiveUser.shifts.push({
                destination: shift.destination,
                from: null,
                id: 0,
                listOrder: users.length + 1,
                monthYear: shift.monthYear,
                position: inactiveUser.position,
                proposalDate: shift.proposalDate,
                to: null,
                userId: inactiveUser.id,
                userName: inactiveUser.name,
                userSurname: inactiveUser.surname
            });
        });

        users.push(inactiveUser);
        inactiveUsers.splice(index, 1);
        this.planCard.update(c => ({ ...c!, users: users, inactiveUsers: inactiveUsers }));
        this.uploadedCard = structuredClone(this.planCard());
        this.nothingChanged.set(false);
    }

    removeFromActive(activeUser: ProposalUser, index: number) {
        const inactiveUsers = [...this.planCard()!.inactiveUsers];
        const users = [...this.planCard()!.users];
        activeUser.shifts = [];
        inactiveUsers.push(activeUser);
        users.splice(index, 1);
        this.planCard.update(c => ({ ...c!, users: users, inactiveUsers: inactiveUsers }));
        this.uploadedCard = structuredClone(this.planCard());
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
        const url = this.BASE_ROUTE + 'Proposals/GenerateProposalPDF';

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

    getProposalsByMonthAndDestination() {
        let httpOptions = {
            headers: new HttpHeaders({
                'user-role': this.authService.getUser().role,
            })
        }
        if (this.monthYear().length === 5) {
            this.monthYear.set('0' + this.monthYear());
        }
        const url = this.BASE_ROUTE + `Proposals/GetProposalsByMonthAndDestination?monthYear=${this.monthYear()}&destination=${this.destination()}`;
        return this.http.get<Response>(url, httpOptions);
    }

    checkNothingChanged() {
        let changed = true;
        for (let i = 0; i < this.uploadedCard!.users.length; i++) {
            for (let j = 0; j < this.uploadedCard!.users[i].shifts.length; j++) {
                if ((this.uploadedCard!.users[i].shifts[j].from !== this.planCard()!.users[i].shifts[j].from) || (this.uploadedCard!.users[i].shifts[j].to !== this.planCard()!.users[i].shifts[j].to)) {
                    changed = false;
                }
            }
        }
        this.nothingChanged.set(changed)
    }

    updatePositions(currentIndex: number, targetIndex: number) {
        const users = [...this.planCard()!.users];
        const user = users.splice(currentIndex, 1)[0];
        const insertAt = targetIndex === currentIndex ? targetIndex + 1 : targetIndex;
        users.splice(insertAt, 0, user);
        this.planCard.update(c => ({ ...c!, users: users }));
        this.checkNothingChanged();
    }

    private updateShiftListOrders() {
        const users = [...this.planCard()!.users];
        users.forEach((user, i) => {
            user.shifts.forEach(shift => {
                shift.listOrder = i;
            });
        });
        this.planCard.update(c => ({ ...c!, users: users }));
    }

    private saveProposals(card: ProposalCard) {
        const url = this.BASE_ROUTE + `Proposals/CreateUpdate`;
        return this.http.post<Response>(url, card);
    }
}