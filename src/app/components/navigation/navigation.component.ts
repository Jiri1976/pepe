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
  styles: [
    `
      .menu {
        left: 5px;
        bottom: 5px;
        position: fixed;
        width: 55px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        ul {
          margin: 0;
          padding: 0;
        }
      }

      @media screen and (max-width: 690px) and (max-height: 640px) {
        :host#plans {
          .menu {
            ul {
              overflow-y: auto;
              height: calc(100vh - 150px);
              scroll-behavior: smooth;
              scrollbar-width: none;
              display: flex;
              flex-direction: column;
            }
          }
        }

        .menu {
          left: 0px;
        }
      }

      @media screen and (max-width: 690px) {
        .menu {
          left: 0px;
        }
      }

      @media screen and (max-height: 360px) {
        ul {
          overflow-y: auto;
          height: calc(100vh - 70px);
          scroll-behavior: smooth;
          scrollbar-width: none;
        }
      }
    `,
  ],
})
export class NavigationComponent {
  @ContentChild('toggleBtn', { static: true })
  toggleBtn!: ElementRef<HTMLElement>;
}
