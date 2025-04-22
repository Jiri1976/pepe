import { animate, state, style, transition, trigger } from "@angular/animations";

export const EnterLeaveAnimation = [
    trigger('enter-leave', [
        state('false', style({ opacity: 0, scale: 0, height: '0', display: 'inline' })),
        state('true', style({ opacity: 1, scale: 1, display: 'inline' })),
        transition('false <=> true', animate('0.5s ease-in-out'))
    ])
];