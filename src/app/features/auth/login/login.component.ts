import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import LoginRequest from '../../../models/auth/LoginRequest';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  public loginForm: FormGroup;
  public loginRequest: LoginRequest;
  public isLoading = false;
  public showPassword = false;
  private returnUrl: string = '/';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    this.loginRequest = {
      username: '',
      password: ''
    };
  }

  // Método para envío del formulario
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.login();
  }

  // Método principal de login
  login(): void {
    this.isLoading = true;

    this.loginRequest.username = this.loginForm.value.username;
    this.loginRequest.password = this.loginForm.value.password;

    console.log('Login Request:', this.loginRequest);

    this.authService.login(this.loginRequest).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        this.isLoading = false;

        // Verificar si el login fue exitoso basado en la respuesta
        if (response.status === 'success' || response.token) {
          // Simular toast notification
          alert(`¡Bienvenida ${this.authService.getCurrentUserName()}! Has iniciado sesión exitosamente`);

          let redirectPath = '/dashboard';
          // Redirigir después del login exitoso
          setTimeout(() => {
            this.router.navigate([redirectPath]);
          }, 1000);
        } else {
          throw new Error(response.mensaje || 'Error en la autenticación');
        }
      },
      error: (error) => {
        console.error('Login failed', error);
        this.isLoading = false;

        // Determinar el mensaje de error apropiado
        let errorMessage = 'Error de autenticación: Email o contraseña incorrectos';

        if (error.error && error.error.mensaje) {
          errorMessage = error.error.mensaje;
        } else if (error.message) {
          errorMessage = error.message;
        }

        // Simular toast notification
        alert(errorMessage);

        // Limpiar el formulario de contraseña en caso de error
        this.loginForm.patchValue({ password: '' });
      }
    });
  }  // Métodos de validación
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} es requerido`;
      }
      if (field.errors['email']) {
        return 'Por favor ingresa un email válido';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} debe tener al menos 6 caracteres`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      username: 'El email',
      password: 'La contraseña'
    };
    return displayNames[fieldName] || fieldName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

}
