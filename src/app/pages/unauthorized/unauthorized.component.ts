import { Component, inject } from '@angular/core';
import { AuthStore } from '../../stores/auth-store/auth.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  imports: [],
  template: `
    <main class="message-page">
      <section class="message-card" aria-labelledby="unauthorized-title">
        <div class="illustration-wrap">
          <img src="./unauthorized.jpg" alt="" />
        </div>
        <span class="status-badge">Přístup odepřen · 403</span>
        <h1 id="unauthorized-title">Tato stránka není určena pro vás</h1>
        <p>
          Nemáte oprávnění k zobrazení této stránky. Zkuste se přihlásit jiným
          účtem nebo se vraťte na hlavní stránku.
        </p>
        <div class="actions">
          <button class="secondary-action" type="button" (click)="backToMain()">
            <i class="bi bi-house" aria-hidden="true"></i>
            Hlavní stránka
          </button>
          <button class="primary-action" type="button" (click)="logout()">
            <i class="bi bi-box-arrow-in-right" aria-hidden="true"></i>
            Přihlásit se znovu
          </button>
        </div>
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
        min-height: 100dvh;
        align-items: center;
        justify-content: center;
        padding: 32px 16px;
        background: #f7f8fa;
      }

      .message-card {
        display: flex;
        width: min(480px, 100%);
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
          border-radius: 14px;
          object-fit: cover;
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
        letter-spacing: 0.06em;
        margin-top: 20px;
      }

      h1 {
        margin: 14px 0 0;
        color: #292524;
        font-size: clamp(20px, 4vw, 25px);
        font-weight: 700;
        letter-spacing: -0.035em;
      }

      p {
        max-width: 360px;
        margin: 9px 0 22px;
        color: #78716c;
        font-size: 12px;
        font-weight: 400;
        line-height: 1.6;
      }

      .actions {
        display: flex;
        width: 100%;
        flex-wrap: wrap;
        justify-content: center;
        gap: 9px;
      }

      button {
        display: inline-flex;
        min-height: 42px;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0 15px;
        border: 1px solid transparent;
        border-radius: 10px;
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
          box-shadow: 0 5px 12px rgba(41, 37, 36, 0.12);
        }

        &:focus-visible {
          outline: 3px solid rgba(249, 115, 22, 0.3);
          outline-offset: 2px;
        }
      }

      .primary-action {
        border-color: #292524;
        background: #292524;
        color: #fff;

        &:hover {
          background: #44403c;
        }
      }

      .secondary-action {
        border-color: #e7e5e4;
        background: #fff;
        color: #57534e;

        &:hover {
          background: #f5f5f4;
          color: #292524;
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

        .actions {
          flex-direction: column-reverse;
        }

        .actions button {
          width: 100%;
        }
      }
    `,
  ],
})
export class UnauthorizedComponent {
  readonly store = inject(AuthStore);
  router = inject(Router);

  backToMain() {
    this.router.navigate(['/main']);
  }

  logout() {
    this.store.logOut();
  }
}
