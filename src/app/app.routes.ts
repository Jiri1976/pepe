import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { requireRole } from './guards/require-role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component'),
    title: 'Přihlášení',
  },
  {
    path: 'main',
    loadComponent: () => import('./pages/main/main.component'),
    canActivate: [AuthGuard],
    title: 'Hlavní strana',
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./pages/users/users.component').then((m) => m.UsersComponent),
    title: 'Uživatelé',
    canActivate: [AuthGuard, requireRole('Admin')],
  },
  {
    path: 'warehouse',
    loadComponent: () =>
      import('./pages/warehouse/warehouse.component').then(
        (m) => m.WarehouseComponent,
      ),
    canActivate: [AuthGuard, requireRole('Admin', 'Master')],
    title: 'Sklad',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/warehouse/warehouse-overview/warehouse-overview.component').then(
            (m) => m.WarehouseOverviewComponent,
          ),
        title: 'Celkový přehled',
      },
      {
        path: 'warehouse-units',
        loadComponent: () =>
          import('./components/warehouse/warehouse-units/warehouse-units.component').then(
            (m) => m.WarehouseUnitsComponent,
          ),
        title: 'Jednotlivé položky',
      },
      {
        path: 'warehouse-items',
        loadComponent: () =>
          import('./components/warehouse/warehouse-items/warehouse-items.component').then(
            (m) => m.WarehouseItemsComponent,
          ),
        title: 'Skladové položky',
        canActivate: [requireRole('Admin')],
      },
    ],
  },
  {
    path: 'shifts',
    loadComponent: () =>
      import('./pages/shifts/shifts.component').then((m) => m.ShiftsComponent),
    canActivate: [AuthGuard, requireRole('Admin', 'Master')],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/shifts/cards-view/cards-view.component').then(
            (m) => m.CardsViewComponent,
          ),
        title: 'Směny',
      },
      {
        path: 'daily',
        loadComponent: () =>
          import('./components/shifts/daily/daily.component').then(
            (m) => m.DailyComponent,
          ),
        title: 'Denní směny',
      },
    ],
  },
  {
    path: 'plans',
    loadComponent: () =>
      import('./pages/plans/plans.component').then((m) => m.PlansComponent),
    canActivate: [AuthGuard, requireRole('Admin', 'Master')],
    title: 'Rozpis směn',
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./pages/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent,
      ),
    title: 'Neoprávněný přístup',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/page-not-found/page-not-found.component').then(
        (m) => m.PageNotFoundComponent,
      ),
    title: 'Stránka nenalezena',
  },
];
