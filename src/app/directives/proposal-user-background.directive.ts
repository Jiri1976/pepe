import { Directive, HostBinding, Input } from '@angular/core';

type ProposalStyle = {
    background: string;
    color?: string;
};

@Directive({
    selector: '[setProposalUserBackground]',
    standalone: true
})
export class ProposalUserBackgroundDirective {
    @Input('setProposalUserBackground') position = '';

    private readonly styleMap: Record<string, ProposalStyle> = {
        Helper: {
            background: 'var(--proposal-yellow)',
            color: 'var(--main-dark)'
        },
        Driver: {
            background: 'var(--white)',
            color: 'var(--main-dark)'
        },
        Cook: {
            background: 'var(--proposal-lime)',
            color: 'var(--main-dark)'
        },
        Pizza: {
            background: 'var(--proposal-green)',
            color: 'var(--white)'
        }
    };

    private get styles(): ProposalStyle {
        return this.styleMap[this.position] ?? {
            background: 'var(--white)',
            color: 'var(--black)'
        };
    }

    @HostBinding('style.--background-color')
    get background(): string {
        return this.styles.background;
    }

    @HostBinding('style.color')
    get color(): string | null {
        return this.styles.color ?? null;
    }
}