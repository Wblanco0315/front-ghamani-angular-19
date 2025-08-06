import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    title: 'Login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    title: 'Register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)
  },
  {
    path:'',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
