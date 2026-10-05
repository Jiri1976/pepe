import {
  ApplicationConfig,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { TokenInterceptor } from './interceptor/token.interceptor';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { globalHttpErrorInterceptor } from './interceptor/global-http-error.interceptor';
import { provideHotToastConfig } from '@ngxpert/hot-toast';
import { initializeAuth } from './auth.initializer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(initializeAuth),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(
      withInterceptors([TokenInterceptor, globalHttpErrorInterceptor]),
    ),
    providePrimeNG({
      theme: {
        preset: Aura,
      },
      translation: {
        firstDayOfWeek: 1,
        dayNames: [
          'Ned\u011ble',
          'Pond\u011bl\u00ed',
          '\u00dater\u00fd',
          'St\u0159eda',
          '\u010ctvrtek',
          'P\u00e1tek',
          'Sobota',
        ],
        dayNamesShort: ['Ne', 'Po', '\u00dat', 'St', '\u010ct', 'P\u00e1', 'So'],
        dayNamesMin: ['Ne', 'Po', '\u00dat', 'St', '\u010ct', 'P\u00e1', 'So'],
        monthNames: [
          'Leden',
          '\u00danor',
          'B\u0159ezen',
          'Duben',
          'Kv\u011bten',
          '\u010cerven',
          '\u010cervenec',
          'Srpen',
          'Z\u00e1\u0159\u00ed',
          '\u0158\u00edjen',
          'Listopad',
          'Prosinec',
        ],
        monthNamesShort: [
          'Led',
          '\u00dano',
          'B\u0159e',
          'Dub',
          'Kv\u011b',
          '\u010cvn',
          '\u010cvc',
          'Srp',
          'Z\u00e1\u0159',
          '\u0158\u00edj',
          'Lis',
          'Pro',
        ],
        today: 'Dnes',
        clear: 'Vymazat',
        dateFormat: 'dd.mm.yy',
        weekHeader: 'T\u00fdd',
      },
      license:
        'eyJpZCI6IjQyZTYzM2MxLWVlMzItNGU0ZS1iMTk3LTE0NWMzMmYwYjgzYiIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3ODUzMzA0NzIsImV4cCI6MTgxNjg2NjQ3Mn0._lXlqpYTr7HSxB20bmKg4K98gLaAimXuXisupOepUSuRqULCH0gRm1gcSjv2jXP3xWcTrAvYI3ddgiMDU3XpCQ',
    }),
    AuthService,
    provideHotToastConfig({
      position: 'bottom-right',
    }),
  ],
};
