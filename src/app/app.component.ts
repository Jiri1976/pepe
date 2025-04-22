import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./components/header/header.component";
import { AlertComponent } from "./components/alert/alert.component";
import { AuthService } from './services/auth.service';
import { RouteAnimation } from './animations/route.animation';
import { PrimeNG } from 'primeng/config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, AlertComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [RouteAnimation]
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  user = computed(() => this.authService.user());
  title = 'pepe';

  private primeConfig = inject(PrimeNG);

  constructor() { }

  ngOnInit(): void {
    this.authService.autoLogin();
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

  prepareRoute(outlet: RouterOutlet) {
    return (
      outlet?.activatedRouteData &&
      outlet.activatedRouteData['animation']
    );
  }
}
