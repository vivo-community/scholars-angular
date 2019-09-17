import { Routes } from '@angular/router';

import { AuthGuard } from './core/guard/auth.guard';
import { Role } from './core/model/user';

export const routes: Routes = [
    {
        path: 'admin', loadChildren: () => import('./+admin').then(m => m.AdminModule), canActivate: [AuthGuard], data: {
            roles: [Role.ROLE_SUPER_ADMIN, Role.ROLE_ADMIN],
            tags: [
                { name: 'view', content: 'Scholars Administration' }
            ]
        }
    },
    {
        path: 'directory', loadChildren: () => import('./+directory').then(m => m.DirectoryModule), canActivate: [], data: {
            tags: [
                { name: 'view', content: 'Scholars Directory' }
            ]
        }
    },
    {
        path: 'discovery', loadChildren: () => import('./+discovery').then(m => m.DiscoveryModule), canActivate: [], data: {
            tags: [
                { name: 'view', content: 'Scholars Discovery' }
            ]
        }
    },
    {
        path: 'display', loadChildren: () => import('./+display').then(m => m.DisplayModule), canActivate: [], data: {
            tags: [
                { name: 'view', content: 'Scholars Display' }
            ]
        }
    },
    {
        path: '', loadChildren: () => import('./+dashboard').then(m => m.DashboardModule), canActivate: [], data: {
            tags: [
                { name: 'title', content: 'Scholars' }
            ]
        }
    },
    { path: 'individual/:id', redirectTo: '/display/:id', pathMatch: 'full' },
    { path: 'individual/:id/:view/:tab', redirectTo: '/display/:id/:view/:tab', pathMatch: 'full' },
    { path: '**', redirectTo: '' }
];
