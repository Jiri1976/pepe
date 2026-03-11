import { ApplicationConfig, inject, provideEnvironmentInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { TokenInterceptor } from './interceptor/token.interceptor';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { globalHttpErrorInterceptor } from './interceptor/global-http-error.interceptor';
import { provideHotToastConfig } from '@ngxpert/hot-toast';
import { ToasterService } from './services/toaster.service';
import { SignalService } from './services/signal.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
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
    ToasterService,
    provideHotToastConfig({
      position: 'bottom-right'
    }),
    provideEnvironmentInitializer(() => {
      inject(SignalService,);
    })
  ]
};
