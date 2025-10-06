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
        title: 'Přihlášení'
    },
    {
        path: 'main',
        loadComponent: () => import('./pages/main/main.component').then(m => m.MainComponent),
        canMatch: [AuthGuard],
        title: 'Hlavní strana'
    },
    {
        path: 'users',
        loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
        title: 'Uživatelé',
        canMatch: [AdminGuard],
        data: { role: 'Admin' }
    },
    {
        path: 'warehouse',
        loadComponent: () => import('./pages/warehouse/warehouse.component').then(m => m.WarehouseComponent),
        canMatch: [AdminMasterGuard],
        title: 'Sklad',
        data: { role: ['Admin', 'Master'] },
        children: [
            {
                path: '',
                loadComponent: () => import('./components/warehouse/warehouse-overview/warehouse-overview.component').then(m => m.WarehouseOverviewComponent),
                title: 'Celkový přehled',
                canMatch: [AdminMasterGuard],
                data: { role: ['Admin', 'Master'] },
            },
            {
                path: 'warehouse-units',
                loadComponent: () => import('./components/warehouse/warehouse-units/warehouse-units.component').then(m => m.WarehouseUnitsComponent),
                title: 'Jednotlivé položky',
                canMatch: [AdminMasterGuard],
                data: { role: ['Admin', 'Master'] },
            },
            {
                path: 'warehouse-items',
                loadComponent: () => import('./components/warehouse/warehouse-items/warehouse-items.component').then(m => m.WarehouseItemsComponent),
                title: 'Skladové položky',
                canMatch: [AdminGuard],
                data: { role: 'Admin' }
            }
        ]
    },
    {
        path: 'shifts',
        loadComponent: () => import('./pages/shifts/shifts.component').then(m => m.ShiftsComponent),
        canMatch: [AdminMasterGuard],
        title: 'Směny',
        data: { role: ['Admin', 'Master'] }
    },
    {
        path: 'plans',
        loadComponent: () => import('./pages/plans/plans.component').then(m => m.PlansComponent),
        canMatch: [AdminMasterGuard],
        title: 'Rozpis směn',
        data: { role: ['Admin', 'Master'] }
    },
    {
        path: '**',
        component: PageNotFoundComponent,
        title: 'Stránka nenalezena'
    }
];
