import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { TokenInterceptor } from './interceptor/token.interceptor';
import { ConfirmationService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { globalHttpErrorInterceptor } from './interceptor/global-http-error.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHotToastConfig } from '@ngxpert/hot-toast';
import { ToasterService } from './services/toaster.service';
import { SignalService } from './services/signal.service';

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
    AuthService,
    SignalService,
    ToasterService,
    ConfirmationService,
    provideHotToastConfig({
      position: 'bottom-right'
    })
  ]
};
