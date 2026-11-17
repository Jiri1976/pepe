import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  imports: [],
  template: `
    <main class="message-page">
      <section class="message-card" aria-labelledby="not-found-title">
        <div class="illustration-wrap">
          <img src="./error.png" alt="" />
        </div>
        <span class="status-badge">Chyba 404</span>
        <h1 id="not-found-title">Stránka nebyla nalezena</h1>
        <p>Odkaz možná nefunguje nebo byla stránka přesunuta.</p>
        <button class="primary-action" type="button" (click)="backToMain()">
          <i class="bi bi-house" aria-hidden="true"></i>
          Zpět na hlavní stránku
        </button>
      </section>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100%;
      }

      .message-page {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100dvh;
        padding: 32px 16px;
        background: #f7f8fa;
      }

      .message-card {
        display: flex;
        width: min(460px, 100%);
        flex-direction: column;
        align-items: center;
        padding: clamp(24px, 5vw, 40px);
        border: 1px solid #e8e5e4;
        border-radius: 20px;
        background: #fff;
        box-shadow: 0 16px 48px rgba(41, 37, 36, 0.09);
        text-align: center;
      }

      .illustration-wrap {
        display: grid;
        width: 180px;
        height: 150px;
        margin-bottom: 20px;
        place-items: center;

        img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
      }

      .status-badge {
        padding: 6px 11px;
        border: 1px solid #fed7aa;
        border-radius: 999px;
        background: #fff7ed;
        color: #c2410c;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.08em;
        margin-top: 15px;
      }

      h1 {
        margin: 14px 0 0;
        color: #292524;
        font-size: clamp(20px, 4vw, 25px);
        font-weight: 700;
        letter-spacing: -0.035em;
      }

      p {
        margin: 9px 0 22px;
        color: #78716c;
        font-size: 12px;
        font-weight: 400;
        line-height: 1.6;
      }

      .primary-action {
        display: inline-flex;
        min-height: 42px;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0 17px;
        border: 1px solid #292524;
        border-radius: 10px;
        background: #292524;
        color: #fff;
        font-family: 'Montserrat', sans-serif;
        font-size: 11px;
        font-weight: 650;
        cursor: pointer;
        transition:
          transform 150ms ease,
          background 150ms ease,
          box-shadow 150ms ease;

        &:hover {
          transform: translateY(-1px);
          background: #44403c;
          box-shadow: 0 5px 12px rgba(41, 37, 36, 0.14);
        }

        &:focus-visible {
          outline: 3px solid rgba(249, 115, 22, 0.3);
          outline-offset: 2px;
        }
      }

      @media (max-width: 480px) {
        .illustration-wrap {
          width: 145px;
          height: 125px;
        }

        .message-card {
          border-radius: 16px;
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
