import { Routes } from '@angular/router';

export const dashboardRoutes:Routes = [
  {
    title: 'Dashboard',
    path: 'admin',
    loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
  },
  {
    title: 'Dashboard',
    path:'home',
    loadComponent: () => import('./home-dashboard/home-dashboard.component').then(m => m.HomeDashboardComponent),
  },
  {
    title: 'Dashboard',
    path: 'products',
    loadComponent: () => import('./view-products/view-products.component').then(m => m.ViewProductsComponent),
  },
  {
    title: 'Dashboard',
    path: 'orders',
    loadComponent: () => import('./view-orders/view-orders.component').then(m => m.ViewOrdersComponent),
  },
  {
    path:'',
    redirectTo: 'home',
    pathMatch: 'full'
  }
  /*
  {
    title: 'Dashboard',
    path: 'client',
   loadComponent: () => import('./client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent),
  }
   */
]
