import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_BASE_URL = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    const loginRequest: LoginRequest = {
      username,
      password
    };

    return this.http.post<LoginResponse>(
      `${this.API_BASE_URL}/auth/login`,
      loginRequest
    );
  }

  storeCredentials(userId: number, username: string, password: string, token?: string): void {
    const currentUser = {
      id: userId,
      username,
      password
    };

    console.log('[Auth] Storing credentials for user:', username);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    if (token) {
      localStorage.setItem('token', token);
    }

    const encodedCredentials = btoa(`${username}:${password}`);
    localStorage.setItem('credentials', encodedCredentials);
  }

  getCurrentUser(): any {
    const currentUserJson = localStorage.getItem('currentUser');
    if (currentUserJson) {
      try {
        return JSON.parse(currentUserJson);
      } catch (error) {
        console.error('[Auth] Error parsing currentUser:', error);
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  logout(): void {
    console.log('[Auth] Logging out user');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('credentials');
    localStorage.removeItem('user');
  }

  getPassword(): string | null {
    const currentUser = this.getCurrentUser();
    return currentUser?.password || null;
  }

  getUsername(): string | null {
    const currentUser = this.getCurrentUser();
    return currentUser?.username || null;
  }
}
