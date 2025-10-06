import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AlertService } from './services/alert.service';
import { AuthService } from './services/auth.service';
import { MessageService } from 'primeng/api';
import { TokenInterceptor } from './interceptor/token.interceptor';
import { ConfirmationService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { globalHttpErrorInterceptor } from './interceptor/global-http-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([TokenInterceptor, globalHttpErrorInterceptor]),
      withFetch()),
    provideAnimations(),
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
