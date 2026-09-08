import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  imports: [],
  template: `
    <div class="wrapper">
      <img src="./error.png" width="300" height="300" />
      <h2>Stránka nebyla nalezena!</h2>
      <p>Zpět na <button (click)="backToMain()">hlavní stránku</button>.</p>
    </div>
  `,
  styles: [
    `
      .wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
      }

      .wrapper h2 {
        color: #cf0a0a;
        font-weight: bold;
        text-align: center;
      }

      p {
        color: var(--main-dark);
        font-weight: 500;
        font-size: 1.2rem;
        text-align: center;

        button {
          border: none;
          outline: none;
          background: var(--white);
          cursor: pointer;
          color: var(--main-dark);
          font-weight: 500;
          margin: 0;
          padding: 0;
          text-decoration: underline;
        }
      }

      @media screen and (max-width: 690px) {
        .wrapper img {
          width: 200px;
          height: 200px;
        }
      }
    `,
  ],
})
export class PageNotFoundComponent {
  router = inject(Router);

  backToMain() {
    this.router.navigate(['/main']);
  }
}
