import { customError, required, SchemaPathTree, validate } from "@angular/forms/signals";
import { ProposalUser } from "../../models/proposals/proposalUser.interface";
import { Proposal } from "../../models/proposals/proposal.interface";
import { ProposalCard } from "../../models/proposals/proposalCard.interface";

export function getToken(): string | null {
    return localStorage.getItem('token');
};

export function initializeMonthYear(): string {
    const month = new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1).toString() : (new Date().getMonth() + 1).toString();
    const year = (new Date().getFullYear()).toString();
    return month + year;
}

export function deepEqual(a: unknown, b: unknown): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

export function getSelectedMonthYear(date: Date) {
    const MONTHS_NUM = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    return MONTHS_NUM[date.getMonth()] + date.getFullYear();
}

export function sortInactiveUsers(users: ProposalUser[]): ProposalUser[] {
    return [...users].sort((a, b) => {
        const s = a.surname.localeCompare(b.surname);
        return s !== 0 ? s : a.name.localeCompare(b.name);
    });
}

export function setTime(time: string | null, date: string | null): Date | null {
    if (time === null || date == null) {
        return null;
    }
    if (time === 'F-M' || time === 'OVA') {
        return new Date(parseInt(date.split('.')[2]), parseInt(date.split('.')[1]) - 1, parseInt(date.split('.')[0]), 11, 0);
    }
    else {
        return new Date(parseInt(date.split('.')[2]), parseInt(date.split('.')[1]) - 1, parseInt(date.split('.')[0]), parseInt(time.split(':')[0]), parseInt(time.split(':')[1]));
    }
}

export function prepareForDeleteing(cards: ProposalCard[], destination: string): ProposalCard[] {
    let currentCard = cards.find(c => c.destination === destination);
    let oppositeCard = cards.find(c => c.destination === destination);
    if (currentCard!.users.length > 0) {
        currentCard!.inactiveUsers = currentCard!.users;
    }

    if (oppositeCard!.users.length > 0) {
        oppositeCard!.users.forEach(user => {
            user.shifts.filter(s => s.from !== 'F-M' && s.from !== 'OVA');
        });
    }
    return cards;
}

export function buildProposal(a: SchemaPathTree<Proposal>) {
    required(a.timeFrom, { message: 'Čas OD je povinný' });
    required(a.timeTo, { message: 'Čas DO je povinný' });
    validate(a.timeFrom, ({ value, valueOf }) => {
        proposalTimesValidator(value(), valueOf(a.timeTo))
    });
    validate(a.timeTo, ({ value, valueOf }) =>
        proposalTimesValidator(valueOf(a.timeFrom), value())
    );
    validate(a.timeFrom, ({ value }) => timeFromStartsAtEleven(value()));
    validate(a.timeTo, ({ value }) => timeToCheck(value()));
}

function timeFromStartsAtEleven(timeFrom: Date | null) {
    if (timeFrom === null) {
        return;
    }

    if (timeFrom.getHours() < 11) {
        return {
            kind: 'invalidTimeFrom',
            message: 'Směna musí začínat v 11:00'
        }
    }

    return null;
}

function timeToCheck(timeTo: Date | null) {
    if (timeTo === null) {
        return null;
    }

    const hour = timeTo.getHours();
    const minute = timeTo.getMinutes();
    const isFridaySaturday = timeTo.getDay() === 5 || timeTo.getDay() === 6;

    if (isFridaySaturday) {
        if (hour > 23 || (hour === 23 && minute > 0)) {
            return {
                kind: 'invalidTimeTo',
                message: 'Směna musí končit ve 23:00'
            };
        }
    } else {
        if (hour > 22 || (hour === 22 && minute > 0)) {
            return {
                kind: 'invalidTimeTo',
                message: 'Směna musí končit ve 22:00'
            };
        }
    }
    return null;
}

function proposalTimesValidator(timeFrom: Date | null, timeTo: Date | null) {
    if (!timeFrom || !timeTo) {
        return null;
    }
    if (timeFrom >= timeTo) {
        return customError({
            kind: 'destinationsInvalid',
            message: 'Zkontroluj časy',
        });
    }
    return null;
}