import { Component, ContentChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-navigation',
  standalone: true,
  template: `
    <div class="menu">
      <ul>
          <ng-content></ng-content>
      </ul>
    </div>
    `,
  styles: [`
  .menu {
    left: 10px;
    bottom: 10px;
    position: fixed;
    width: 55px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--white);
    border: 1px solid var(--main-border-color);
    border-radius: 7px;
    box-shadow: inset 0 0 8px 1px var(--main-border-color);

    ul {
        margin: 0;
        padding: 0;
    }
}
    `],
})
export class NavigationComponent {
  @ContentChild('toggleBtn', { static: true })
  toggleBtn!: ElementRef<HTMLElement>;
}
