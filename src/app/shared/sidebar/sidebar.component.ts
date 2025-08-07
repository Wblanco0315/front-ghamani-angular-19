import { AuthService } from './../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import JwtUtilsService from '../../core/services/utils/JwtUtils.service';

export interface NavbarItem {
  path: string;
  icon: string;
  name: string;
}

export interface LateralNavbarProps {
  title: string;
  navItem: NavbarItem[];
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink],
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {

  public username: string;
  public role: string;
  @Input() propierties: LateralNavbarProps = {
    title: 'Dashboard',
    navItem: []
  };

  constructor(private authService: AuthService) {
    this.username = authService.getNombre() || 'usuario';
    this.role = authService.getCurrentUserRole() || 'invitado';
  }

  ngOnInit(): void {

  }

  // Método de prueba
  testClick(): void {
    console.log('Test click funcionando');
    alert('Test click funcionando');
  }

  // Método para cerrar sesión
  logout(): void {
    // Confirmar antes de cerrar sesión
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      try {
        console.log('Cerrando sesión...'); // Debug
        // Usar el servicio de autenticación para cerrar sesión
        this.authService.logout();

        // Recargar la página para limpiar el estado de la aplicación
        window.location.reload();
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        // En caso de error, intentar limpiar manualmente y redirigir
        localStorage.clear();
        window.location.href = '/auth/login';
      }
    } else {
      console.log('Logout cancelado por el usuario'); // Debug
    }
  }
}
