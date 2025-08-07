import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../core/services/auth.service';
import RegistroRequest from '../../../models/auth/RegistroRequest';
import Rol from '../../../models/auth/Rol';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  public registerForm: FormGroup;
  public registerRequest: RegistroRequest;
  public registerRole: Rol;
  public isLoading = false;
  public showPassword = false;
  private returnUrl: string = '/';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      acceptTerms: [false, [Validators.requiredTrue]],
      newsletter: [false]
    });

    this.registerRole = { displayName: 'Cliente' };

    this.registerRequest = {
      username: '',
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      telefono: '',
      rol: 'CLIENTE'
    };
  }

  // Método para envío del formulario
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.register();
  }

  // Método principal de registro
  register(): void {
    this.isLoading = true;

    this.registerRequest = {
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      nombre: this.registerForm.value.nombre,
      apellido: this.registerForm.value.apellido,
      telefono: this.registerForm.value.telefono,
      rol: 'CLIENTE'
    };

    console.log('Register Request:', this.registerRequest);

    this.authService.register(this.registerRequest).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        this.isLoading = false;

        // Verificar si el registro fue exitoso
        if (response.status === 'success') {
          alert(`¡Cuenta creada exitosamente! Bienvenida a Ghamani, ${this.registerRequest.nombre}`);

          // Si el backend autentica automáticamente después del registro
          if (response.token && this.authService.isAuthenticated()) {
            // Redirigir al área de cliente
            setTimeout(() => {
              this.router.navigate(['/shop']);
            }, 1000);
          } else {
            // Redirigir al login para que inicie sesión manualmente
            setTimeout(() => {
              this.router.navigate(['/auth/login'], {
                queryParams: {
                  message: 'Cuenta creada exitosamente. Por favor inicia sesión.',
                  email: this.registerRequest.email
                }
              });
            }, 1000);
          }
        } else {
          throw new Error(response.mensaje || 'Error en el registro');
        }
      },
      error: (error) => {
        console.error('Registration failed', error);
        this.isLoading = false;

        // Determinar el mensaje de error apropiado
        let errorMessage = 'Error al crear la cuenta. Por favor, intenta nuevamente.';

        if (error.error && error.error.mensaje) {
          errorMessage = error.error.mensaje;
        } else if (error.message) {
          errorMessage = error.message;
        }

        // Verificar errores específicos comunes
        if (errorMessage.toLowerCase().includes('email')) {
          errorMessage = 'El email ya está registrado. Por favor usa otro email.';
        } else if (errorMessage.toLowerCase().includes('username')) {
          errorMessage = 'El nombre de usuario ya existe. Por favor elige otro.';
        }

        alert(errorMessage);

        // Marcar campos específicos como inválidos si es necesario
        if (errorMessage.includes('email')) {
          this.registerForm.get('email')?.setErrors({ 'emailTaken': true });
        }
        if (errorMessage.includes('username')) {
          this.registerForm.get('username')?.setErrors({ 'usernameTaken': true });
        }
      }
    });
  }  // Métodos de validación
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} es requerido`;
      }
      if (field.errors['email']) {
        return 'Por favor ingresa un email válido';
      }
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} debe tener al menos ${minLength} caracteres`;
      }
      if (field.errors['pattern']) {
        if (fieldName === 'telefono') {
          return 'Por favor ingresa un número de teléfono válido';
        }
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      username: 'El nombre de usuario',
      email: 'El email',
      password: 'La contraseña',
      nombre: 'El nombre',
      apellido: 'El apellido',
      telefono: 'El teléfono'
    };
    return displayNames[fieldName] || fieldName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  // Métodos para validación de contraseña
  getPasswordStrength(): string {
    const password = this.registerForm.get('password')?.value || '';
    let strength = 0;

    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const strengthMap: { [key: string]: string } = {
      'weak': 'Contraseña débil',
      'medium': 'Contraseña moderada',
      'strong': 'Contraseña fuerte'
    };
    return strengthMap[this.getPasswordStrength()];
  }

  // Métodos de navegación
  goToLogin(): void {
    this.router.navigate(['/dashboard']);
  }

  // Métodos placeholder para funcionalidades futuras
  registerWithGoogle(): void {
    alert('El registro con Google estará disponible pronto');
  }

  openTerms(): void {
    alert('Términos y condiciones - Esta funcionalidad estará disponible pronto');
  }

  openPrivacy(): void {
    alert('Política de privacidad - Esta funcionalidad estará disponible pronto');
  }
}
