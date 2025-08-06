import { ApiEndpoints } from './../constants/api-endpoints';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import RegistroRequest from '../../models/auth/RegistroRequest';
import LoginRequest from '../../models/auth/LoginRequest';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = ApiEndpoints.AUTH;

  constructor(private http:HttpClient) {}

  login(loginRequest:LoginRequest){
    return this.http.post(this.apiUrl+'login', loginRequest);
  }

  register(registerRequest:RegistroRequest){
    return this.http.post(this.apiUrl+'registro', registerRequest);
  }

}
