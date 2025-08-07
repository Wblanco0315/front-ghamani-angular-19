import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

interface UserProfile {
  id: string;
  nombre: string;
  username: string;
  email: string;
  role: string;
  fechaRegistro?: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  genero?: string;
}

@Component({
  selector: 'app-view-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './view-profile.component.html',
  styleUrl: './view-profile.component.scss'
})
export class ViewProfileComponent implements OnInit {
  // Señales reactivas
  userProfile = signal<UserProfile | null>(null);
  isLoading = signal(false);
  isEditing = signal(false);
  showPasswordModal = signal(false);

  // Formularios
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  // Estados computados
  isFormValid = computed(() => this.profileForm?.valid || false);
  hasChanges = computed(() => this.profileForm?.dirty || false);

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private initializeForms(): void {
    this.profileForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(/^[0-9+\-\s()]*$/)]],
      direccion: [''],
      fechaNacimiento: [''],
      genero: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  private loadUserProfile(): void {
    this.isLoading.set(true);
    
    try {
      // Obtener información básica del usuario desde el servicio de autenticación
      const currentUser = this.authService.getCurrentUser();
      
      if (currentUser) {
        const profile: UserProfile = {
          id: 'user_id', // En una implementación real, esto vendría del backend
          nombre: currentUser.nombre || '',
          username: currentUser.username || '',
          email: currentUser.email || '',
          role: currentUser.role || '',
          fechaRegistro: new Date().toISOString().split('T')[0], // Mock data
          telefono: '', // Estos campos se cargarían desde el backend
          direccion: '',
          fechaNacimiento: '',
          genero: ''
        };

        this.userProfile.set(profile);
        this.updateForm(profile);
      }
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private updateForm(profile: UserProfile): void {
    this.profileForm.patchValue({
      nombre: profile.nombre,
      username: profile.username,
      email: profile.email,
      telefono: profile.telefono || '',
      direccion: profile.direccion || '',
      fechaNacimiento: profile.fechaNacimiento || '',
      genero: profile.genero || ''
    });
  }

  // Métodos públicos
  enableEdit(): void {
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    const profile = this.userProfile();
    if (profile) {
      this.updateForm(profile);
    }
    this.profileForm.markAsPristine();
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      this.isLoading.set(true);
      
      const formData = this.profileForm.value;
      console.log('Guardando perfil:', formData);
      
      // Aquí iría la llamada al backend para actualizar el perfil
      // this.userService.updateProfile(formData).subscribe(...)
      
      // Simulación de guardado
      setTimeout(() => {
        const currentProfile = this.userProfile();
        if (currentProfile) {
          const updatedProfile = { ...currentProfile, ...formData };
          this.userProfile.set(updatedProfile);
        }
        
        this.isEditing.set(false);
        this.profileForm.markAsPristine();
        this.isLoading.set(false);
        
        // Mostrar mensaje de éxito (podrías usar un servicio de notificaciones)
        console.log('Perfil actualizado exitosamente');
      }, 1000);
    }
  }

  openPasswordModal(): void {
    this.showPasswordModal.set(true);
    this.passwordForm.reset();
  }

  closePasswordModal(): void {
    this.showPasswordModal.set(false);
    this.passwordForm.reset();
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.isLoading.set(true);
      
      const passwords = this.passwordForm.value;
      console.log('Cambiando contraseña...');
      
      // Aquí iría la llamada al backend para cambiar la contraseña
      // this.authService.changePassword(passwords).subscribe(...)
      
      // Simulación
      setTimeout(() => {
        this.isLoading.set(false);
        this.closePasswordModal();
        console.log('Contraseña cambiada exitosamente');
      }, 1000);
    }
  }

  getFieldError(fieldName: string): string | null {
    const field = this.profileForm.get(fieldName);
    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors?.['email']) {
        return 'Email inválido';
      }
      if (field.errors?.['minlength']) {
        return `Mínimo ${field.errors?.['minlength'].requiredLength} caracteres`;
      }
      if (field.errors?.['pattern']) {
        return 'Formato inválido';
      }
    }
    return null;
  }

  getPasswordFieldError(fieldName: string): string | null {
    const field = this.passwordForm.get(fieldName);
    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors?.['minlength']) {
        return `Mínimo ${field.errors?.['minlength'].requiredLength} caracteres`;
      }
    }
    
    if (fieldName === 'confirmPassword' && this.passwordForm.errors?.['passwordMismatch']) {
      return 'Las contraseñas no coinciden';
    }
    
    return null;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'No especificado';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getRoleDisplayName(role: string): string {
    const roleMap: { [key: string]: string } = {
      'ADMINISTRADOR': 'Administrador',
      'CLIENTE': 'Cliente',
      'USUARIO': 'Usuario'
    };
    return roleMap[role?.toUpperCase()] || role;
  }
}
