import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent),
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  }
];
