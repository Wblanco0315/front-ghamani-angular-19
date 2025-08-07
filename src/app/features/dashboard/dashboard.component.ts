import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { SidebarComponent, NavbarItem, LateralNavbarProps } from '../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  sidebarProps: LateralNavbarProps = {
    title: 'Dashboard',
    navItem: []
  };

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    // Verificar autenticación al cargar
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.setupSidebarNavigation();
  }

  private setupSidebarNavigation(): void {
    const baseNavItems: NavbarItem[] = [
      { path: '/dashboard/home', icon: 'fas fa-home', name: 'Inicio' }
    ];

    if (this.isAdmin()) {
      this.sidebarProps = {
        title: 'Admin Panel',
        navItem: [
          ...baseNavItems,
          { path: '/dashboard/admin', icon: 'fas fa-cogs', name: 'Administración' },
          { path: '/dashboard/products', icon: 'fas fa-box', name: 'Productos' },
          { path: '/dashboard/orders', icon: 'fas fa-clipboard-list', name: 'Pedidos' }
        ]
      };
    } else if (this.isClient()) {
      this.sidebarProps = {
        title: 'Mi Cuenta',
        navItem: [
          ...baseNavItems,
          { path: '/dashboard/client', icon: 'fas fa-user', name: 'Mi Perfil' },
          { path: '/dashboard/products', icon: 'fas fa-heart', name: 'Ver Productos' },
          { path: '/dashboard/orders', icon: 'fas fa-shopping-bag', name: 'Mis Pedidos' }
        ]
      };
    }
  }

  // Métodos básicos para el template
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isClient(): boolean {
    return this.authService.isClient();
  }

  userDisplayName(): string {
    return this.authService.getNombre() || 'Usuario';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  navigateToSection(section: string): void {
    if (section === 'admin') {
      this.router.navigate(['/dashboard/admin']);
    } else if (section === 'client') {
      this.router.navigate(['/dashboard/client']);
    }
  }
}
