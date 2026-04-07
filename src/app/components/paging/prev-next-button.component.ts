import { Component, input } from '@angular/core';

@Component({
    selector: 'app-prev-next-button',
    standalone: true,
    template: `
        <button class="prev-next" [class.disabled]="disabled()">
            <i class="bi" [class]="icon()"></i>
        </button>
    `,
    styles: [`
        .prev-next {
            width: 65px;
            height: 30px;
            border: 1px solid var(--main-border-color);
            background-color: var(--white);
            font-weight: 900;
            transition: 0.3s;
            margin: 5px;
            border-radius: 7px;
             box-shadow: inset 0 0 1px 1px var(--main-border-color);
        }

        .prev-next:hover {
            background-color: var(--main-dark);
            box-shadow: none;
            color: var(--white);
        }

        .prev-next.disabled {
            cursor: default;
            background-color: var(--white);
            color: var(--main-dark);
            pointer-events: none;
        }
    `],
})
export class PrevNextButtonComponent {
    icon = input<string>();
    disabled = input<boolean>(false);
}
