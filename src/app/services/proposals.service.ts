import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Response } from '../models/response.interface';
import { ProposalCard } from "../models/proposals/proposalCard.interface";
import { AuthService } from "./auth.service";
import { SelectedProposal } from "../models/proposals/selectedProposal.interface";
import { UsersService } from "./users.service";
import { concatMap, of, tap } from "rxjs";
import { AlertService } from "./alert.service";
import { GetUserDTO } from "../models/users/getUserDTO.interface";
import { ErrorHandlingService } from "./error-handling.service";
import { ProposalsPDF } from "../models/proposals/proposalsPDF.interface";

@Injectable({
    providedIn: 'root'
})
export class ProposalsService {
    private MONTHS_NAMES = ["LED", "ÚNO", "BŘE", "DUB", "KVĚ", "ČER", "ČRV", "SRP", "ZÁŘ", "ŘÍJ", "LIS", "PRO"];
    private http = inject(HttpClient);
    private usersService = inject(UsersService);
    private authService = inject(AuthService);
    private destroyRef = inject(DestroyRef);
    private alertService = inject(AlertService);
    private errorHandlingService = inject(ErrorHandlingService);
    private BASE_ROUTE = environment.SHIFTS_PATH;
    private initialProposalCard: ProposalCard = {
        id: 0,
        monthYear: '',
        monthYearName: '',
        destination: '',
        proposalDays: []
    };

    private initialSelectedProposal: SelectedProposal = {
        name: '',
        x: 0,
        y: 0,
        date: '',
        user: '',
        from: '',
        to: '',
    };

    destination = signal<string>('F-M');
    monthYear = signal<string>((new Date().getMonth() + 1).toString() + (new Date().getFullYear()).toString());
    proposalCard = signal<ProposalCard>(this.initialProposalCard);
    selectedProposal = signal<SelectedProposal>(this.initialSelectedProposal);
    savedUsers = signal<GetUserDTO[]>([]);
    isProposalLoading = signal(false);
    filteredUsers = signal<GetUserDTO[]>([]);
    uploadedCard = structuredClone(this.proposalCard());
    nothingChanged = signal(true);
    calendarTitle = signal<string>(this.MONTHS_NAMES[new Date().getMonth()] + ' ' + new Date().getFullYear().toString().substring(2));
    users = signal<{ id: number, userId: number, name: string, position: string }[]>([]);
    shifts = signal<{ id: number; name: string, from: string, to: string }[]>([]);
    assignments = signal<{ [userId: number]: { [day: number]: any[] } }>({});
    timeFrom = signal<Date>(new Date());
    timeTo = signal<Date>(new Date());
    isSaving = signal(false);
    cookCount = signal<number>(0);

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

    getProposalsOverview() {
        const url = this.BASE_ROUTE + `Proposals/GetProposalsOverview`;
        return this.http.get<Response>(url);
    }


    deleteProposalCard(cardId: number) {
        let httpOptions = {
            headers: new HttpHeaders({
                'user-role': this.authService.getUser().role,
            })
        };
        const url = this.BASE_ROUTE + `Proposals/DeleteProposalCard?cardId=${cardId}`;
        return this.http.delete<Response>(url, httpOptions);
    }

    onSave() {
        const subscription = this.saveProposals(this.proposalCard()).pipe(
            tap(response => {
                if (response === null) {
                    this.isSaving.set(false);
                    this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
                } else if (response.isSuccess === false) {
                    this.isSaving.set(false);
                    this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
                } else {
                    this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: 'Úspěšně uloženo!' });
                    if (this.proposalCard().id === 0) {
                        let _card = structuredClone(this.proposalCard());
                        _card.id = response.result;
                        this.proposalCard.set(_card);
                    }
                    this.uploadedCard = structuredClone(this.proposalCard());
                    this.checkNothingChanged();
                    this.isSaving.set(false);
                }
            })
        ).subscribe({
            error: error => this.handleError(error)
        });

        this.destroyRef.onDestroy(() => {
            subscription.unsubscribe();
        });
    }

    onDelete() {
        this.isProposalLoading.set(true);
        const subscription = this.deleteProposalCard(this.proposalCard().id).pipe(
            concatMap(response => {
                if (response === null) {
                    this.isProposalLoading.set(false);
                    this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
                } else if (response.isSuccess === false) {
                    this.isProposalLoading.set(false);
                    this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
                } else if (response.isSuccess) {
                    let monthYear = (new Date().getMonth() + 1).toString() + (new Date().getFullYear()).toString();
                    if (monthYear.length === 5) {
                        monthYear = '0' + monthYear;
                    }
                    this.monthYear.set(monthYear);
                    return this.getProposalCardObservable();
                }
                return of();
            }),
        ).subscribe({
            next: () => {
                this.alertService.setAlert({ severity: 'success', summary: 'Success', detail: `Karta byla smazána!` });
            },
            error: error => this.handleError(error)
        });

        this.destroyRef.onDestroy(() => {
            subscription.unsubscribe();
        });
    }

    uploadProposals() {
        this.isProposalLoading.set(true);
        const subscription = this.usersService.getProposalUsers(this.destination()).pipe(
            concatMap(response => {
                if (response === null) {
                    this.isProposalLoading.set(false);
                    this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
                } else if (response.isSuccess === false) {
                    this.isProposalLoading.set(false);
                    this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
                } else if (response.isSuccess) {
                    this.savedUsers.set(response.result);
                    return this.getProposalCardObservable();
                }
                return of();
            }),
        ).subscribe({
            next: () => { },
            error: error => this.handleError(error)
        });

        this.destroyRef.onDestroy(() => {
            subscription.unsubscribe();
        });
    }

    setProposals() {
        let card = { ...this.proposalCard() };
        for (let i = 0; i < this.users().length; i++) {
            let user = this.users()[i];
            for (let j = 0; j < card.proposalDays.length; j++) {
                let proposalDay = card.proposalDays[j];
                let updateShift = proposalDay.proposalShifts.filter(s => s.userId === user.userId);
                if (updateShift[0]) {
                    let _assigments = { ...this.assignments() }
                    let assignment: any = _assigments[i + 1][j];
                    if (assignment[0]) {
                        updateShift[0].from = assignment[0].from;
                        updateShift[0].to = assignment[0].to;
                    } else {
                        updateShift[0].from = '';
                        updateShift[0].to = '';
                    }
                }
            }
        }
        this.proposalCard.set(card);
        this.checkNothingChanged();
    }

    updateAssigments(assigments: { [userId: number]: { [day: number]: any[] } }) {
        this.assignments.set(assigments);
    }

    setSelectedProposal(proposal: SelectedProposal) {
        this.selectedProposal.set(proposal);
    }

    setTime(proposal: SelectedProposal) {
        if (proposal.from === 'F-M' || proposal.from === 'OVA') {
            this.timeFrom.set(new Date(parseInt(proposal.date.split('.')[2]), parseInt(proposal.date.split('.')[1]) - 1, parseInt(proposal.date.split('.')[0]), 11, 0));
            this.timeTo.set(new Date(parseInt(proposal.date.split('.')[2]), parseInt(proposal.date.split('.')[1]) - 1, parseInt(proposal.date.split('.')[0]), parseInt(proposal.to?.split(':')[0]!), parseInt(proposal.to?.split(':')[1]!)));
        }
        else {
            this.timeFrom.set(new Date(parseInt(proposal.date.split('.')[2]), parseInt(proposal.date.split('.')[1]) - 1, parseInt(proposal.date.split('.')[0]), parseInt(proposal.from?.split(':')[0]!), parseInt(proposal.from?.split(':')[1]!)));
            this.timeTo.set(new Date(parseInt(proposal.date.split('.')[2]), parseInt(proposal.date.split('.')[1]) - 1, parseInt(proposal.date.split('.')[0]), parseInt(proposal.to?.split(':')[0]!), parseInt(proposal.to?.split(':')[1]!)));
        }


    }

    uploadPDF(pdfCard: ProposalsPDF, role: string) {
        const url = this.BASE_ROUTE + 'Proposals/GenerateProposalPDF';

        return this.http.post<Response>(url, pdfCard, {
            headers: new HttpHeaders()
                .set('Content-Type', 'application/json')
                .set('user-role', role)
        });
    }

    resetProposalCard() {
        this.proposalCard.set(this.initialProposalCard);
    }

    resetCalendars() {
        this.calendarTitle.set(this.MONTHS_NAMES[new Date().getMonth()] + ' ' + new Date().getFullYear().toString().substring(2));
        this.monthYear.set((new Date().getMonth() + 1).toString() + (new Date().getFullYear()).toString());
    }

    private setAssigmentsFromSavedProposals() {
        let _assigments = { ...this.assignments() };
        this.users().forEach((user) => {
            _assigments[user.id] = {};
            this.proposalCard().proposalDays.forEach((day, index) => {
                let updateShift = day.proposalShifts.filter(s => s.userId === user.userId);
                if (updateShift[0]) {
                    let assignment: { id?: number, name: string, from: string, to: string } = { name: '', from: '', to: '' };
                    if (updateShift[0].from === '11:00' && (updateShift[0].to === '22:00' || updateShift[0].to === '23:00')) {
                        assignment.name = 'W';
                        assignment.from = '11:00';
                        assignment.to = updateShift[0].to;
                    } else if (updateShift[0].from === '11:00' && updateShift[0].to === '17:00') {
                        assignment.name = 'M';
                        assignment.from = '11:00';
                        assignment.to = '17:00';
                    } else if (updateShift[0].from === '17:00' && (updateShift[0].to === '22:00' || updateShift[0].to === '23:00')) {
                        assignment.name = 'A';
                        assignment.from = '17:00';
                        assignment.to = updateShift[0].to;
                    } else if (updateShift[0].from === 'F-M' || updateShift[0].from === 'OVA') {
                        assignment.name = 'D';
                        assignment.from = updateShift[0].from;
                        assignment.to = '00:00';
                    }
                    else if (updateShift[0].from !== '' && updateShift[0].to !== '') {
                        assignment.name = 'W';
                        assignment.from = updateShift[0].from;
                        assignment.to = updateShift[0].to;
                    }
                    if (assignment.name === '') {
                        _assigments[user.id][index] = [];
                    } else {
                        _assigments[user.id][index] = [assignment];
                    }
                }
            });
            this.assignments.set(_assigments);
        });
    }

    private getProposalCardObservable() {
        return this.getProposalsByMonthAndDestination().pipe(
            tap(response => {
                if (response === null) {
                    this.isProposalLoading.set(false);
                    this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: 'Něco se pokazilo, zkus to znovu.' });
                } else if (response.isSuccess === false) {
                    this.isProposalLoading.set(false);
                    this.alertService.setAlert({ severity: 'error', summary: 'Error', detail: response.errorMessage });
                } else if (response !== null && response.isSuccess) {
                    if (response.result === '') {
                        let date = new Date(parseInt(this.monthYear().substring(2)), parseInt(this.monthYear().substring(0, 2)) - 1, 1);
                        this.calendarTitle.set(this.MONTHS_NAMES[parseInt(this.monthYear().substring(0, 2)) - 1] + ' ' + date.getFullYear().toString().substring(2));
                        this.isProposalLoading.set(false);
                        return;
                    }
                    this.proposalCard.set(response.result);
                    this.filterUsers();
                    this.initializeUsers();

                    if (this.proposalCard().id !== 0) {
                        this.setAssigmentsFromSavedProposals();
                    } else {
                        this.initializeAssignments();
                    }
                    this.uploadedCard = structuredClone(this.proposalCard());
                    this.checkNothingChanged();
                    let date = new Date(parseInt(this.monthYear().substring(2)), parseInt(this.monthYear().substring(0, 2)) - 1, 1);
                    this.calendarTitle.set(this.MONTHS_NAMES[parseInt(this.monthYear().substring(0, 2)) - 1] + ' ' + date.getFullYear().toString().substring(2));
                    this.isProposalLoading.set(false);
                }
            })
        );
    }

    private checkNothingChanged() {
        let changed = true;
        for (let i = 0; i < this.uploadedCard.proposalDays.length; i++) {
            for (let j = 0; j < this.uploadedCard.proposalDays[i].proposalShifts.length; j++) {
                if ((this.uploadedCard.proposalDays[i].proposalShifts[j].from !== this.proposalCard().proposalDays[i].proposalShifts[j].from) || (this.uploadedCard.proposalDays[i].proposalShifts[j].to !== this.proposalCard().proposalDays[i].proposalShifts[j].to)) {
                    changed = false;
                }
            }
        }
        this.nothingChanged.set(changed)
    }

    private filterUsers() {
        let users = this.savedUsers().filter(u => u.role === 'User' && u.destination === this.destination());
        this.filteredUsers.set(users);
    }

    private initializeUsers() {
        let today = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        let _monthYear = this.monthYear().length === 5 ? '0' + this.monthYear() : this.monthYear()
        let day = new Date(parseInt(_monthYear.substring(2, 6)), parseInt(_monthYear.substring(0, 2)) - 1, 1);

        let users: { id: number, userId: number, name: string, position: string }[] = [];
        let cooks: GetUserDTO[] = [];
        let drivers: GetUserDTO[] = [];
        let ids = this.proposalCard().proposalDays[0].proposalShifts.map(a => a.userId);
        if (day < today) {
            let _users = this.savedUsers().filter(u => ids.includes(u.id));
            cooks = _users!.filter(u => u.position === 'Cook' && u.destination === this.destination() && u.role === 'User');
            drivers = _users!.filter(u => u.position === 'Driver' && u.destination === this.destination() && u.role === 'User');
        }

        if (day.getFullYear() === today.getFullYear() && day.getMonth() === today.getMonth()) {
            let _users = this.savedUsers().filter(u => ids.includes(u.id) || u.isActive);
            cooks = _users!.filter(u => u.position === 'Cook' && u.destination === this.destination() && u.role === 'User');
            drivers = _users!.filter(u => u.position === 'Driver' && u.destination === this.destination() && u.role === 'User');
        }

        if (day > today) {
            let _users = this.savedUsers().filter(u => u.isActive);
            cooks = _users!.filter(u => u.position === 'Cook' && u.destination === this.destination() && u.role === 'User');
            drivers = _users!.filter(u => u.position === 'Driver' && u.destination === this.destination() && u.role === 'User');
        }

        cooks = cooks!.sort((a, b) =>
            a.name.localeCompare(b.name) ||
            a.surname.localeCompare(b.surname)
        );

        drivers = drivers.sort((a, b) =>
            a.name.localeCompare(b.name) ||
            a.surname.localeCompare(b.surname)
        );

        if (cooks.length > 0) {
            this.cookCount.set(cooks.length);

            cooks.forEach((user, index) => {
                users.push({ id: index + 1, userId: user.id, name: `${user.name}`, position: user.position })
            });

            if (drivers.length > 0) {
                drivers.forEach((user, index) => {
                    users.push({ id: index + 1 + cooks.length, userId: user.id, name: `${user.name}`, position: user.position })
                });
            }
        } else {
            if (drivers.length > 0) {
                drivers.forEach((user, index) => {
                    users.push({ id: index + 1, userId: user.id, name: `${user.name}`, position: user.position })
                });
            }
        }
        this.users.set(users);
    }

    private initializeAssignments() {
        this.users().forEach((user) => {
            this.assignments()[user.id] = {};
            this.proposalCard().proposalDays.forEach((day, index) => {
                this.assignments()[user.id][index] = [];
            });
        });
    }

    private saveProposals(card: ProposalCard) {
        if (card.id === 0) {
            const url = this.BASE_ROUTE + `Proposals/Create`;
            return this.http.post<Response>(url, card);
        } else {
            const url = this.BASE_ROUTE + `Proposals/Update`;
            return this.http.post<Response>(url, card);
        }
    }

    private handleError = (errorRes: HttpErrorResponse) => {
        this.isSaving?.set(false);
        this.isProposalLoading?.set(false);
        return this.errorHandlingService.handleError(errorRes);
    };
}