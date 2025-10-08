import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { AlertService } from './services/alert.service';
import { AuthService } from './services/auth.service';
import { MessageService } from 'primeng/api';
import { TokenInterceptor } from './interceptor/token.interceptor';
import { ConfirmationService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { globalHttpErrorInterceptor } from './interceptor/global-http-error.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([TokenInterceptor, globalHttpErrorInterceptor]),
      withFetch()),
    providePrimeNG(
      {
        theme: {
          preset: Aura
        }
      }
    ),
    AlertService,
    AuthService,
    MessageService,
    ConfirmationService
  ]
};
