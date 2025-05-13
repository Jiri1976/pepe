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
                    animate('500ms ease-out', style({ opacity: 0 })),
                ], { optional: true }),
            ])
        ]),









        // transition('main <=> users', [
        //     query(':enter, :leave',
        //         style({ position: 'fixed', width: '100%' }),
        //         { optional: true }),
        //     group([
        //         query(':enter', [
        //             style({ opacity: 0, transform: 'scale(0.7)' }),
        //             animate('0.4s ease-in',
        //                 style({ opacity: 1, transform: 'scale(1)' }))
        //         ], { optional: true }),
        //         query(':leave', [
        //             style({ opacity: 1, transform: 'scale(1)' }),
        //             animate('0.4s ease-out',
        //                 style({ opacity: 0, transform: 'scale(0.7)' }))
        //         ], { optional: true }),
        //     ])
        // ]),
        // transition('warehouse <=> main', [
        //     query(':enter, :leave',
        //         style({ position: 'fixed', width: '100%' }),
        //         { optional: true }),
        //     group([
        //         query(':enter', [
        //             style({ opacity: 0, transform: 'scale(0.7)' }),
        //             animate('0.5s ease-in',
        //                 style({ opacity: 1, transform: 'scale(1)' }))
        //         ], { optional: true }),
        //         query(':leave', [
        //             style({ opacity: 1, transform: 'scale(1)' }),
        //             animate('0.5s ease-out',
        //                 style({ opacity: 0, transform: 'scale(0.7)' }))
        //         ], { optional: true }),
        //     ])
        // ]),
        // transition('shifts <=> main', [
        //     query(':enter, :leave',
        //         style({ position: 'fixed', width: '100%' }),
        //         { optional: true }),
        //     group([
        //         query(':enter', [
        //             style({ opacity: 0, transform: 'scale(0.7)' }),
        //             animate('0.5s ease-in',
        //                 style({ opacity: 1, transform: 'scale(1)' }))
        //         ], { optional: true }),
        //         query(':leave', [
        //             style({ opacity: 1, transform: 'scale(1)' }),
        //             animate('0.5s ease-out',
        //                 style({ opacity: 0, transform: 'scale(0.7)' }))
        //         ], { optional: true }),
        //     ])
        // ]),
        // transition('plans <=> main', [
        //     query(':enter, :leave',
        //         style({ position: 'fixed', width: '100%' }),
        //         { optional: true }),
        //     group([
        //         query(':enter', [
        //             style({ opacity: 0, transform: 'scale(0.7)' }),
        //             animate('0.5s ease-in',
        //                 style({ opacity: 1, transform: 'scale(1)' }))
        //         ], { optional: true }),
        //         query(':leave', [
        //             style({ opacity: 1, transform: 'scale(1)' }),
        //             animate('0.5s ease-out',
        //                 style({ opacity: 0, transform: 'scale(0.7)' }))
        //         ], { optional: true }),
        //     ])
        // ]),
        // transition('plans <=> shifts', [
        //     query(':enter, :leave',
        //         style({ position: 'fixed', width: '100%' }),
        //         { optional: true }),
        //     group([
        //         query(':enter', [
        //             style({ opacity: 0, transform: 'scale(0.7)' }),
        //             animate('0.5s ease-in',
        //                 style({ opacity: 1, transform: 'scale(1)' }))
        //         ], { optional: true }),
        //         query(':leave', [
        //             style({ opacity: 1, transform: 'scale(1)' }),
        //             animate('0.5s ease-out',
        //                 style({ opacity: 0, transform: 'scale(0.7)' }))
        //         ], { optional: true }),
        //     ])
        // ]),
        // transition('users <=> warehouse', [
        //     query(':enter, :leave',
        //         style({ position: 'fixed', width: '100%' }),
        //         { optional: true }),
        //     group([
        //         query(':enter', [
        //             style({ opacity: 0, transform: 'scale(0.7)' }),
        //             animate('0.5s ease-in',
        //                 style({ opacity: 1, transform: 'scale(1)' }))
        //         ], { optional: true }),
        //         query(':leave', [
        //             style({ opacity: 1, transform: 'scale(1)' }),
        //             animate('0.5s ease-out',
        //                 style({ opacity: 0, transform: 'scale(0.7)' }))
        //         ], { optional: true }),
        //     ])
        // ]),
        // transition('shifts <=> warehouse', [
        //     query(':enter, :leave',
        //         style({ position: 'fixed', width: '100%' }),
        //         { optional: true }),
        //     group([
        //         query(':enter', [
        //             style({ opacity: 0, transform: 'scale(0.7)' }),
        //             animate('0.5s ease-in',
        //                 style({ opacity: 1, transform: 'scale(1)' }))
        //         ], { optional: true }),
        //         query(':leave', [
        //             style({ opacity: 1, transform: 'scale(1)' }),
        //             animate('0.5s ease-out',
        //                 style({ opacity: 0, transform: 'scale(0.7)' }))
        //         ], { optional: true }),
        //     ])
        // ]),
        // transition('users <=> shifts', [
        //     query(':enter, :leave',
        //         style({ position: 'fixed', width: '100%' }),
        //         { optional: true }),
        //     group([
        //         query(':enter', [
        //             style({ opacity: 0, transform: 'scale(0.7)' }),
        //             animate('0.5s ease-in',
        //                 style({ opacity: 1, transform: 'scale(1)' }))
        //         ], { optional: true }),
        //         query(':leave', [
        //             style({ opacity: 1, transform: 'scale(1)' }),
        //             animate('0.5s ease-out',
        //                 style({ opacity: 0, transform: 'scale(0.7)' }))
        //         ], { optional: true }),
        //     ])
        // ]),
        // transition('* => login', [
        //     query(':enter, :leave',
        //         style({ position: 'fixed', width: '100%' }),
        //         { optional: true }),
        //     group([
        //         query(':enter', [
        //             style({ opacity: 0, transform: 'scale(0.7)' }),
        //             animate('0.5s ease-in',
        //                 style({ opacity: 1, transform: 'scale(1)' }))
        //         ], { optional: true }),
        //         query(':leave', [
        //             style({ opacity: 1, transform: 'scale(1)' }),
        //             animate('0.5s ease-out',
        //                 style({ opacity: 0, transform: 'scale(0.7)' }))
        //         ], { optional: true }),
        //     ])
        // ]),

        // transition('login => main', [
        //     query(':enter, :leave',
        //         style({ position: 'fixed', width: '100%' }),
        //         { optional: true }),
        //     group([
        //         query(':enter', [
        //             style({ opacity: 0, transform: 'scale(0.7)' }),
        //             animate('0.5s ease-in',
        //                 style({ opacity: 1, transform: 'scale(1)' }))
        //         ], { optional: true }),
        //         query(':leave', [
        //             style({ opacity: 0, transform: 'scale(0)' })
        //         ], { optional: true }),
        //     ])
        // ]),
    ]);