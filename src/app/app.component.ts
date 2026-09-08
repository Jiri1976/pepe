import { Component, inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { PrimeNG } from 'primeng/config';
import { RouterOutlet } from '@angular/router';
import { IsAuthenticated } from './directives/is-authenticated.directive';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, IsAuthenticated],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private primeConfig = inject(PrimeNG);
  private readonly document = inject(DOCUMENT);

  ngOnInit(): void {
    const splash = this.document.getElementById('app-bootstrap-loader');
    if (!splash) {
      this.unlockPageScroll();
      return;
    }

    const minSplashMs = this.getCssDurationMs(
      splash,
      '--bootstrap-intro-ms',
      1500,
    );
    const exitMs = this.getCssDurationMs(splash, '--bootstrap-exit-ms', 180);
    const startedAt = performance.now();
    let isExitScheduled = false;

    const removeSplash = () => {
      if (isExitScheduled) {
        return;
      }

      isExitScheduled = true;
      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(0, minSplashMs - elapsed);
      window.setTimeout(() => {
        splash.classList.add('is-exiting');
        window.setTimeout(() => {
          splash.remove();
          this.unlockPageScroll();
        }, exitMs);
      }, remaining);
    };

    const logo = splash.querySelector('svg');
    if (logo) {
      logo.addEventListener('animationend', removeSplash, { once: true });
      // Fallback for rare cases when animationend does not fire.
      window.setTimeout(removeSplash, minSplashMs + 200);
      return;
    }

    removeSplash();

    this.primeConfig.setTranslation({
      firstDayOfWeek: 1,
      dayNames: [
        'Neděle',
        'Pondělí',
        'Úterý',
        'Středa',
        'Čtvrtek',
        'Pátek',
        'Sobota',
      ],
      dayNamesShort: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'],
      dayNamesMin: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'],
      monthNames: [
        'Leden',
        'Únor',
        'Březen',
        'Duben',
        'Květen',
        'Červen',
        'Červenec',
        'Srpen',
        'Září',
        'Říjen',
        'Listopad',
        'Prosinec',
      ],
      monthNamesShort: [
        'Led',
        'Úno',
        'Bře',
        'Dub',
        'Kvě',
        'Čvn',
        'Čvc',
        'Srp',
        'Zář',
        'Říj',
        'Lis',
        'Pro',
      ],
      today: 'Dnes',
      clear: 'Vymazat',
      dateFormat: 'dd.mm.yy',
      weekHeader: 'Týd',
    });
  }

  private getCssDurationMs(
    splash: HTMLElement,
    variableName: string,
    fallbackMs: number,
  ): number {
    const raw = window
      .getComputedStyle(splash)
      .getPropertyValue(variableName)
      .trim();

    if (!raw) {
      return fallbackMs;
    }

    if (raw.endsWith('ms')) {
      const value = Number.parseFloat(raw.slice(0, -2));
      return Number.isFinite(value) ? value : fallbackMs;
    }

    if (raw.endsWith('s')) {
      const value = Number.parseFloat(raw.slice(0, -1));
      return Number.isFinite(value) ? value * 1000 : fallbackMs;
    }

    const value = Number.parseFloat(raw);
    return Number.isFinite(value) ? value : fallbackMs;
  }

  private unlockPageScroll(): void {
    this.document.documentElement.style.overflow = 'auto';
    this.document.body.style.overflow = 'auto';
  }
}
