import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAdminAccess();
  }

  canActivateChild(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAdminAccess();
  }

  private checkAdminAccess(): boolean | UrlTree {
    // Primero verificar si está autenticado
    if (!this.authService.isAuthenticated()) {
      console.log('Usuario no autenticado. Redirigiendo al login.');
      return this.router.createUrlTree(['/auth/login']);
    }

    // Verificar si tiene rol de administrador
    if (this.authService.isAdmin()) {
      return true;
    } else {
      // Si no es admin, redirigir a la página apropiada según su rol
      console.log('Usuario sin permisos de administrador. Redirigiendo.');

      if (this.authService.isClient()) {
        return this.router.createUrlTree(['/shop']);
      } else {
        return this.router.createUrlTree(['/']);
      }
    }
  }
}
