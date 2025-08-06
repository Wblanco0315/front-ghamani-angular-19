import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import RegistroRequest from '../../../models/auth/RegistroRequest';
import { CommonModule } from '@angular/common';
import Rol from '../../../models/auth/Rol';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  public registerForm:FormGroup;
  public registerRequest: RegistroRequest; // Define the type according to your needs
  public registerRole: Rol;

  constructor(private fb:FormBuilder,private authService:AuthService) {
    this.registerForm = this.fb.group({
        username: [''],
        email: [''],
        password: [''],
        nombre: [''],
        apellido: [''],
        telefono: ['']
    });

    this.registerRole = { displayName: 'Cliente' }; // Por defecto, cliente

    this.registerRequest = {
      username: '',
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      telefono: '',
      rol :'CLIENTE' // Por defecto, cliente
    };
  }
  register() {
    if (this.registerForm.invalid) {
      alert('formulario invalido');
      return;
    }
    this.registerRequest = {
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      nombre: this.registerForm.value.nombre,
      apellido: this.registerForm.value.apellido,
      telefono: this.registerForm.value.telefono,
      rol: 'CLIENTE' // Por defecto, cliente
    };

    console.log('Register Request:', this.registerRequest);

    this.authService.register(this.registerRequest).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        // Aquí puedes manejar la respuesta del registro, como redirigir al usuario
      },
      error: (error) => {
        console.error('Registration failed', error);
        alert('Error al registrarse');
      }
    });

  }

}
