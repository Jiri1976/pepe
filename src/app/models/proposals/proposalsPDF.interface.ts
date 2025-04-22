export interface ProposalsPDF {
    title: string;
    countOfDays: number;
    startDay: string;
    users: UserPDF[];
}

export interface UserPDF {
    name: string;
    position: string;
    shifts: ShiftPDF[];
}

export interface ShiftPDF {
    from: string | null;
    to: string | null;
}