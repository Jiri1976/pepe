import { animate, style, transition, trigger } from "@angular/animations";

export const FastPageAnimation = [
    trigger('fastOut', [
        transition(':leave', [
            animate('100ms ease-out', style({ opacity: 0 })),
        ]),
    ]),
    trigger('fastIn', [
        transition(':enter', [
            style({ opacity: 0 }),
            animate('200ms ease-in', style({ opacity: 1 })),
        ])
    ])
]