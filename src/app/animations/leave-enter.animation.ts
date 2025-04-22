import { animate, state, style, transition, trigger } from "@angular/animations";

export const LeaveEnterAnimation = [
    trigger('leave-enter', [
        state('false', style({ opacity: 1, scale: 1 })),
        state('true', style({ opacity: 0, scale: 0, height: '0' })),
        transition('false <=> true', animate('0.5s ease-in-out'))
    ])
];