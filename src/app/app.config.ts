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
      license:
        'eyJpZCI6IjQyZTYzM2MxLWVlMzItNGU0ZS1iMTk3LTE0NWMzMmYwYjgzYiIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3ODUzMzA0NzIsImV4cCI6MTgxNjg2NjQ3Mn0._lXlqpYTr7HSxB20bmKg4K98gLaAimXuXisupOepUSuRqULCH0gRm1gcSjv2jXP3xWcTrAvYI3ddgiMDU3XpCQ',
    }),
    AuthService,
    provideHotToastConfig({
      position: 'bottom-right',
    }),
  ],
};
