import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

export function jwtInterceptor(request: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  const authService = inject(AuthService);

  // Obtener el token actual
  const token = authService.getAuthToken();

  // Lista de URLs que no requieren autenticación
  const publicUrls = [
    '/auth/login',
    '/auth/registro',
    '/auth/refresh'
  ];

  // Verificar si la URL actual requiere autenticación
  const isPublicUrl = publicUrls.some(url => request.url.includes(url));

  // Si hay token y no es una URL pública, agregar el header Authorization
  if (token && !isPublicUrl) {
    request = addTokenToRequest(request, token);
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si recibimos un error 401 (Unauthorized), el token puede haber expirado
      if (error.status === 401 && !isPublicUrl) {
        return handle401Error(request, next, authService);
      }

      // Si recibimos un error 403 (Forbidden), no tenemos permisos
      if (error.status === 403) {
        authService.logout();
        return throwError(() => new Error('No tienes permisos para realizar esta acción'));
      }

      return throwError(() => error);
    })
  );
}

// Función para agregar el token al request
function addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

// Función para manejar errores 401
function handle401Error(
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<any>> {
  // Verificar si el token está expirando pronto
  if (authService.isTokenExpiringSoon()) {
    // Intentar renovar el token
    return authService.refreshToken().pipe(
      switchMap(() => {
        // Si la renovación es exitosa, reintentar la petición original
        const newToken = authService.getAuthToken();
        if (newToken) {
          const newRequest = addTokenToRequest(request, newToken);
          return next(newRequest);
        }

        // Si no hay nuevo token, cerrar sesión
        authService.logout();
        return throwError(() => new Error('Sesión expirada. Por favor inicia sesión nuevamente.'));
      }),
      catchError((error) => {
        // Si la renovación falla, cerrar sesión
        authService.logout();
        return throwError(() => new Error('Sesión expirada. Por favor inicia sesión nuevamente.'));
      })
    );
  } else {
    // Si el token no está próximo a expirar, simplemente cerrar sesión
    authService.logout();
    return throwError(() => new Error('Sesión expirada. Por favor inicia sesión nuevamente.'));
  }
}
