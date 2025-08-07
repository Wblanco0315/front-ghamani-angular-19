import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth();
  }

  canActivateChild(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth();
  }

  private checkAuth(): boolean | UrlTree {
    if (this.authService.isAuthenticated()) {
      // Verificar si el token está próximo a expirar
      if (this.authService.isTokenExpiringSoon(10)) { // 10 minutos antes
        console.warn('Token próximo a expirar. Considera renovarlo.');
        // Opcional: intentar renovar automáticamente
        // this.authService.refreshToken().subscribe();
      }
      
      return true;
    } else {
      // Redirigir al login si no está autenticado
      console.log('Usuario no autenticado. Redirigiendo al login.');
      return this.router.createUrlTree(['/auth/login']);
    }
  }
}
