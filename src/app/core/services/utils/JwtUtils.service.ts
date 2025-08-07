import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { decodeJwt } from 'jose';

interface DecodedToken {
  sub?: string;
  nombre?: string; // Nombre del usuario
  username?: string;
  email?: string;
  roles?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export default class JwtUtilsService {
  private readonly tokenKey = 'token';
  private readonly userKey = 'user_info';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Método para guardar el token
  setToken(token: string): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem(this.tokenKey, token);

      // También guardar información decodificada del usuario para acceso rápido
      const decodedToken = this.decodeToken(token);
      if (decodedToken) {
        const userInfo = {
          id: decodedToken.sub,
          nombre: decodedToken.nombre,
          username: decodedToken.username,
          email: decodedToken.email,
          role: decodedToken.roles,
          exp: decodedToken.exp,
          iat: decodedToken.iat
        };
        localStorage.setItem(this.userKey, JSON.stringify(userInfo));
      }

      console.log('Token JWT guardado exitosamente');
    } catch (error) {
      console.error('Error al guardar el token:', error);
    }
  }

  // Método para obtener el token
  getToken(): string | null {
    if (!this.isBrowser) return null;

    try {
      return localStorage.getItem(this.tokenKey);
    } catch (error) {
      console.error('Error al obtener el token:', error);
      return null;
    }
  }

  // Método para limpiar el token y datos del usuario
  clearToken(): void {
    if (!this.isBrowser) return;

    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      console.log('Token y datos de usuario eliminados');
    } catch (error) {
      console.error('Error al limpiar el token:', error);
    }
  }

  // Método privado para decodificar el token
  private decodeToken(token: string): DecodedToken | null {
    try {
      return decodeJwt(token) as DecodedToken;
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }

  // Método público para obtener el token decodificado
  getDecodedToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    return this.decodeToken(token);
  }

  // Método para verificar si el token es válido
  isTokenValid(): boolean {
    try {
      const token = this.getToken();
      if (!token) {
        return false;
      }

      const decodedToken = this.decodeToken(token);
      if (!decodedToken || !decodedToken.exp) {
        return false;
      }

      // Verificar si el token no ha expirado
      const currentTime = Math.floor(Date.now() / 1000);
      return decodedToken.exp > currentTime;
    } catch (error) {
      console.error('Error al verificar validez del token:', error);
      return false;
    }
  }

  // Método para obtener el tiempo restante del token en segundos
  getTokenTimeRemaining(): number {
    try {
      const decodedToken = this.getDecodedToken();
      if (decodedToken && decodedToken.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        return Math.max(0, decodedToken.exp - currentTime);
      }
      return 0;
    } catch (error) {
      console.error('Error al calcular tiempo restante del token:', error);
      return 0;
    }
  }

  // Método para obtener el ID del usuario
  getUserId(): string | null {
    try {
      // Primero intentar desde la información almacenada (más rápido)
      const userInfo = this.getStoredUserInfo();
      if (userInfo && userInfo.id) {
        return userInfo.id;
      }

      // Fallback: decodificar el token
      const decodedToken = this.getDecodedToken();
      return decodedToken?.sub || null;
    } catch (error) {
      console.error('Error al obtener ID del usuario:', error);
      return null;
    }
  }

  // Método para obtener el nombre de usuario
  getUserName(): string | null {
    try {
      const userInfo = this.getStoredUserInfo();
      if (userInfo && userInfo.username) {
        return userInfo.username;
      }

      const decodedToken = this.getDecodedToken();
      return decodedToken?.username || null;
    } catch (error) {
      console.error('Error al obtener nombre de usuario:', error);
      return null;
    }
  }

  getNombre(): string | null {
    try {
      const userInfo = this.getStoredUserInfo();
      if (userInfo && userInfo.nombre) {
        return userInfo.nombre;
      }
      const decodedToken = this.getDecodedToken();
      return decodedToken?.nombre || null;
    } catch (error) {
      console.error('Error al obtener nombre del usuario:', error);
      return null;
    }
  }

  // Método para obtener el email del usuario
  getUserEmail(): string | null {
    try {
      const userInfo = this.getStoredUserInfo();
      if (userInfo && userInfo.email) {
        return userInfo.email;
      }

      const decodedToken = this.getDecodedToken();
      return decodedToken?.email || null;
    } catch (error) {
      console.error('Error al obtener email del usuario:', error);
      return null;
    }
  }

  // Método para obtener el rol del usuario
  getUserRole(): string | null {
    try {
      const userInfo = this.getStoredUserInfo();
      if (userInfo && userInfo.roles) {
        return userInfo.roles;
      }

      const decodedToken = this.getDecodedToken();
      return decodedToken?.roles ? decodedToken.roles : null;
    } catch (error) {
      console.error('Error al obtener rol del usuario:', error);
      return null;
    }
  }

  // Método para obtener toda la información del usuario almacenada
  private getStoredUserInfo(): any {
    if (!this.isBrowser) return null;

    try {
      const userInfoStr = localStorage.getItem(this.userKey);
      return userInfoStr ? JSON.parse(userInfoStr) : null;
    } catch (error) {
      console.error('Error al obtener información del usuario almacenada:', error);
      return null;
    }
  }

  // Método para obtener toda la información del usuario
  getUserInfo(): any {
    try {
      return {
        id: this.getUserId(),
        username: this.getUserName(),
        nombre: this.getNombre(),
        email: this.getUserEmail(),
        role: this.getUserRole(),
        tokenValid: this.isTokenValid(),
        timeRemaining: this.getTokenTimeRemaining()
      };
    } catch (error) {
      console.error('Error al obtener información completa del usuario:', error);
      return null;
    }
  }

  // Método para verificar si el token expirará en X minutos
  willTokenExpireIn(minutes: number): boolean {
    const timeRemaining = this.getTokenTimeRemaining();
    return timeRemaining <= (minutes * 60);
  }

  // Método para obtener la fecha de expiración del token
  getTokenExpirationDate(): Date | null {
    try {
      const decodedToken = this.getDecodedToken();
      if (decodedToken && decodedToken.exp) {
        return new Date(decodedToken.exp * 1000);
      }
      return null;
    } catch (error) {
      console.error('Error al obtener fecha de expiración:', error);
      return null;
    }
  }

  // Método para obtener la fecha de emisión del token
  getTokenIssuedDate(): Date | null {
    try {
      const decodedToken = this.getDecodedToken();
      if (decodedToken && decodedToken.iat) {
        return new Date(decodedToken.iat * 1000);
      }
      return null;
    } catch (error) {
      console.error('Error al obtener fecha de emisión:', error);
      return null;
    }
  }
}
