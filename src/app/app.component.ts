import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from "./components/header/header.component";
import { PrimeNG } from 'primeng/config';
import { RouterOutlet } from '@angular/router';
import { IsAuthenticated } from './directives/is-authenticated.directive';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, IsAuthenticated],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private primeConfig = inject(PrimeNG);

  ngOnInit(): void {
    this.primeConfig.setTranslation({
      firstDayOfWeek: 1,
      dayNames: [
        'Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'
      ],
      dayNamesShort: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'],
      dayNamesMin: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'],
      monthNames: [
        'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
        'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
      ],
      monthNamesShort: [
        'Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čvn',
        'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'
      ],
      today: 'Dnes',
      clear: 'Vymazat',
      dateFormat: 'dd.mm.yy',
      weekHeader: 'Týd',
    });
  }
}