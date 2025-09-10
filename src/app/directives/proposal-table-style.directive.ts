import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
    selector: '[proposalTableStyle]',
    standalone: true
})
export class ProposalTableStyleDirective {
    @Input('isUnsavedPassedCard') isUnsavedPassedCard = false;
    @Input('countOfDays') countOfDays: number = 0;

    @HostBinding('style.--margin-top-table')
    get marginTop(): string {
        return this.isUnsavedPassedCard ? '30px' : '';
    }

    @HostBinding('style.--min-width-table')
    get minWidth(): string {
        return `${(this.countOfDays ?? 0) * 40}px`;
    }
}