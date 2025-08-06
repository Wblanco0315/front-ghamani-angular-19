import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
  public loginForm:FormGroup;
  public loginRequest: LoginRequest;

  constructor(private fb: FormBuilder, private authSevice:AuthService) {
    this.loginForm = this.fb.group({
      username: [''],
      password: ['']
    });

    this.loginRequest = {
      username: '',
      password: ''
    };
  }


  login(){
    if (this.loginForm.invalid) {
      alert('formulario invalido');
      return;
    }

    this.loginRequest.username = this.loginForm.value.username;
    this.loginRequest.password = this.loginForm.value.password;

    console.log('Login Request:', this.loginRequest);
    this.authSevice.login(this.loginRequest).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        // Aquí puedes manejar la respuesta del login, como redirigir al usuario
      },
      error: (error) => {
        console.error('Login failed', error);
        alert('Error al iniciar sesión');
      }
    });


  }
}
