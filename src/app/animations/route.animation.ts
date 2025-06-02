import { animate, group, query, style, transition, trigger } from "@angular/animations";

export const RouteAnimation =
    trigger('routeAnimations', [
        transition('* <=> *', [
            query(':enter, :leave',
                style({ position: 'fixed', width: '100%' }),
                { optional: true }
            ),
            group([
                query(':enter', [
                    style({ opacity: 0 }),
                    animate('600ms ease-in', style({ opacity: 1 })),
                ], { optional: true }),
                query(':leave', [
                    animate('400ms ease-out', style({ opacity: 0 })),
                ], { optional: true }),
            ])
        ]),
    ]);