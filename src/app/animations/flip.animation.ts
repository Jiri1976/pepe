import { animate, state, style, transition, trigger } from "@angular/animations";

export const FlipAnimation =
    trigger('flip', [
        state('false', style({ transform: 'none' })),
        state('true', style({ transform: 'rotateX(180deg' })),
        transition('false <=> true', animate('0.8s ease-in-out'))
    ]);

