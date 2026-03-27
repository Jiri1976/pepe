import { Component } from '@angular/core';

@Component({
    selector: 'app-page-not-found',
    imports: [],
    template: `
            <div class="wrapper">
                <img src="./error.png" width="300" height="300">
                <h2>Stránka nebyla nalezena!</h2>
            </div>
    `,
    styles: [`
        .wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100vh;
        }

        .wrapper img {
            margin-top: 150px;
        }

        .wrapper h2 {
            color: #cf0a0a;
            font-weight: bold;
        }
    `]
})
export class PageNotFoundComponent { }
