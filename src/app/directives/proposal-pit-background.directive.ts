import { Directive, HostBinding, Input } from '@angular/core';

type ProposalStyle = {
  background: string;
  color?: string;
};

@Directive({
  selector: '[setProposalPitBackground]',
  standalone: true,
})
export class ProposalPitBackgroundDirective {
  @Input('setProposalPitBackground') position = '';

  private readonly styleMap: Record<string, ProposalStyle> = {
    Helper: {
      background: 'var(--white)',
      color: 'var(--main-dark)',
    },
    Driver: {
      background: 'var(--main-dark)',
      color: 'var(--white)',
    },
    Cook: {
      background: 'var(--white)',
      color: 'var(--proposal-green)',
    },
    Pizza: {
      background: 'var(--white)',
      color: 'var(--proposal-green)',
    },
  };

  private get styles(): ProposalStyle {
    return (
      this.styleMap[this.position] ?? {
        background: 'var(--white)',
        color: 'var(--black)',
      }
    );
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
