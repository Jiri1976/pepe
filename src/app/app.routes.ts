import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';
import { AdminMasterGuard } from './guards/admin-master.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent,
        title: 'Přihlášení',
        data: { animation: 'login' }
    },
    {
        path: 'main',
        loadComponent: () => import('./pages/main/main.component').then(m => m.MainComponent),
        canMatch: [AuthGuard],
        title: 'Hlavní strana',
        data: { animation: 'main' }
    },
    {
        path: 'users',
        loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
        title: 'Uživatelé',
        canMatch: [AdminGuard],
        data: { animation: 'users', role: 'Admin' }
    },
    {
        path: 'warehouse',
        loadComponent: () => import('./pages/warehouse/warehouse.component').then(m => m.WarehouseComponent),
        canMatch: [AdminMasterGuard],
        title: 'Sklad',
        data: { animation: 'warehouse', role: ['Admin', 'Master'] }
    },
    {
        path: 'shifts',
        loadComponent: () => import('./pages/shifts/shifts.component').then(m => m.ShiftsComponent),
        canMatch: [AdminMasterGuard],
        title: 'Směny',
        data: { animation: 'shifts', role: ['Admin', 'Master'] }
    },
    {
        path: 'plans',
        loadComponent: () => import('./pages/plans/plans.component').then(m => m.PlansComponent),
        canMatch: [AdminMasterGuard],
        title: 'Plán směn',
        data: { animation: 'shifts', role: ['Admin', 'Master'] }
    },
    {
        path: '**',
        component: PageNotFoundComponent,
        title: 'Stránka nenalezena'
    }
];
