import { Component, inject } from '@angular/core';
import { AuthStore } from '../../stores/auth-store/auth.store';
import { Router } from '@angular/router';

@Component({
    selector: 'app-unauthorized',
    imports: [],
    template: `
            <div class="wrapper d-flex flex-column align-items-center">
                <img src="./unauthorized.jpg" width="300" height="300">
                <h2 class="mt-5">Stránka není určena pro tebe!</h2>
                <p>Zkus se znovu <button (click)="logout()">přihlásit</button> nebo jdi na <button (click)="backToMain()">hlavní stránku</button>.</p>
            </div>
    `,
    styles: [`
        .wrapper {
            height: 100vh;
        }

        .wrapper img {
            margin-top: 150px;
        }

        .wrapper h2 {
            color: #cf0a0a;
            font-weight: 600;
        }

        p {
            color: var(--main-dark);
            font-weight: 500;
            font-size: 1.2rem;

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
    `]
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
