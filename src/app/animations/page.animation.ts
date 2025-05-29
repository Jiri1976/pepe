import { animate, style, transition, trigger } from "@angular/animations";

export const PageAnimation = [
    trigger('fadeOut', [
        transition(':leave', [
            animate('500ms ease-out', style({ opacity: 0 })),
        ]),
    ]),
    trigger('fadeIn', [
        transition(':enter', [
            style({ opacity: 0 }),
            animate('600ms ease-in', style({ opacity: 1 })),
        ])
    ])
]