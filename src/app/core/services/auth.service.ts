import { ApiEndpoints } from './../constants/api-endpoints';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

import RegistroRequest from '../../models/auth/RegistroRequest';
import LoginRequest from '../../models/auth/LoginRequest';
import AuthResponse from '../../models/auth/AuthResponse';
import JwtUtilsService from './utils/JwtUtils.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = ApiEndpoints.AUTH;

  constructor(
    private http: HttpClient,
    private jwtUtils: JwtUtilsService,
    private router: Router
  ) {}

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = this.jwtUtils.getToken();
    if (!token) {
      return false;
    }

    // Verificar si el token no ha expirado
    try {
      const decodedToken = this.jwtUtils.getDecodedToken();
      if (decodedToken && decodedToken.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        return decodedToken.exp > currentTime;
      }
      return false;
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      this.logout(); // Limpiar token inválido
      return false;
    }
  }

  // Método para verificar si el usuario tiene el rol de administrador
  isAdmin(): boolean {
    return this.isAuthenticated() && this.jwtUtils.getUserRole()?.toUpperCase() === 'ADMINISTRADOR';
  }

  // Método para verificar si el usuario es cliente
  isClient(): boolean {
    return this.isAuthenticated() && this.jwtUtils.getUserRole()?.toUpperCase() === 'CLIENTE';
  }

  // Método para obtener el nombre de usuario actual
  getCurrentUserName(): string | null {
    return this.isAuthenticated() ? this.jwtUtils.getUserName() : null;
  }

  getNombre(): string | null {
    return this.isAuthenticated() ? this.jwtUtils.getNombre() : null;
  }

  // Método para obtener el email del usuario actual
  getCurrentUserEmail(): string | null {
    return this.isAuthenticated() ? this.jwtUtils.getUserEmail() : null;
  }

  // Método para obtener el rol del usuario actual
  getCurrentUserRole(): string | null {
    return this.isAuthenticated() ? this.jwtUtils.getUserRole() : null;
  }

  // Método para obtener información completa del usuario
  getCurrentUser(): any {
    if (!this.isAuthenticated()) {
      return null;
    }

    return {
      nombre: this.getNombre(),
      username: this.getCurrentUserName(),
      email: this.getCurrentUserEmail(),
      role: this.getCurrentUserRole()
    };
  }

  // Método de login mejorado con manejo de JWT
  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiUrl + 'login', loginRequest)
      .pipe(
        tap((response: AuthResponse) => {
          // Verificar que la respuesta tenga el token
          if (response && response.token) {
            // Guardar el token en localStorage usando JwtUtils
            this.jwtUtils.setToken(response.token);
            console.log('Login exitoso. Token guardado.');

            // Log de información del usuario (solo en desarrollo)
            if (!this.isProduction()) {
              const userInfo = this.getCurrentUser();
              console.log('Usuario autenticado:', userInfo);
            }
          } else {
            throw new Error('Respuesta de login inválida: token no encontrado');
          }
        }),
        catchError((error) => {
          console.error('Error en login:', error);
          // Limpiar cualquier token previo en caso de error
          this.logout();
          return throwError(() => error);
        })
      );
  }

  // Método de registro mejorado
  register(registerRequest: RegistroRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiUrl + 'registro', registerRequest)
      .pipe(
        tap((response: AuthResponse) => {
          console.log('Registro exitoso:', response.mensaje);
          // Nota: El registro no necesariamente autentica automáticamente
          // Esto depende de la lógica del backend
          if (response && response.token) {
            this.jwtUtils.setToken(response.token);
            console.log('Usuario registrado y autenticado automáticamente.');
          }
        }),
        catchError((error) => {
          console.error('Error en registro:', error);
          return throwError(() => error);
        })
      );
  }

  // Método para cerrar sesión
  logout(): void {
    // Limpiar el token del localStorage
    this.jwtUtils.clearToken();
    console.log('Sesión cerrada. Token eliminado.');

    // Redirigir al login
    this.router.navigate(['/auth/login']);
  }

  // Método para renovar token (si el backend lo soporta)
  refreshToken(): Observable<AuthResponse> {
    const currentToken = this.jwtUtils.getToken();

    if (!currentToken) {
      return throwError(() => new Error('No hay token para renovar'));
    }

    return this.http.post<AuthResponse>(this.apiUrl + 'refresh', { token: currentToken })
      .pipe(
        tap((response: AuthResponse) => {
          if (response && response.token) {
            this.jwtUtils.setToken(response.token);
            console.log('Token renovado exitosamente.');
          }
        }),
        catchError((error) => {
          console.error('Error al renovar token:', error);
          this.logout(); // Si no se puede renovar, cerrar sesión
          return throwError(() => error);
        })
      );
  }

  // Método para verificar si estamos en producción
  private isProduction(): boolean {
    return false; // Cambiar según tu configuración de environment
  }

  // Método para obtener el token actual (útil para interceptors)
  getAuthToken(): string | null {
    return this.jwtUtils.getToken();
  }

  // Método para verificar permisos específicos
  hasPermission(requiredRole: string): boolean {
    const userRole = this.getCurrentUserRole();
    return userRole === requiredRole;
  }

  // Método para verificar si el token expirará pronto (útil para renovación automática)
  isTokenExpiringSoon(minutesThreshold: number = 5): boolean {
    try {
      const decodedToken = this.jwtUtils.getDecodedToken();
      if (decodedToken && decodedToken.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeUntilExpiration = decodedToken.exp - currentTime;
        const minutesUntilExpiration = timeUntilExpiration / 60;
        return minutesUntilExpiration <= minutesThreshold;
      }
      return true; // Si no podemos determinar, asumir que expira pronto
    } catch (error) {
      console.error('Error al verificar expiración del token:', error);
      return true;
    }
  }

}
