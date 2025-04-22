# Pepe

Chtel bych zkusit nabidnout aplikaci do jedne pizzerie ve F-M (s pobockou v Ostrave), kde prilezitostne rozvazim pizzu. Mela by slouzit k usnadneni administrace.
Je urcena pro spravce a pak pro vedouci smeny ve F-M/Ostrave

Je rozdelena do ctyr bloku:

- uzivatele - seznam pracovniku na pobockach, muzu nastavit aktivni / neaktivni
- navrhy smeny - planovac smen, s moznosti stahnuti planu do pdf souboru
- smeny - seznam odpracovanych smen pro jednotlive pracovniky
- sklad - tady se budou zapisovat polozky jako jsou krabice na pizzu dle velikosti a napoje a jejich stav (pocet kusu) na konci dne

Spravce (admin) ma pristup vsude, vedouci smeny (master) pak nevidi sekci uzivatele + ve zbyvajicich sekcich nema pristup ke vsemu

Aplikace jeste neni kompletni, chybi mi prepracovat hlavne posledni dve sekce a pak to cele trochu vycistit od poznamek, commentu a zbytecneho kodu,
ale snad vam to da nejaky prehled o mych znalostech :-)

Prilozil jsem nejake screeny, jsou ve slozce public/screens

Backend jsem delal v .net a ten uz mam deploynuty na serveru

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
