import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { User } from '../../models/user';
import { environment } from '../../../environments/environment.development';

export interface LoginCredentials {
  email?: string;
  password?: string;
  dni?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = `${environment.apiUrl}/auth`;

  login(credentials: LoginCredentials): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/authenticate`, credentials, {
      withCredentials: true,
    });
  }

  register(userData: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, userData, {
      withCredentials: true,
    });
  }

  // NUEVO MÉTODO: Guarda al usuario respetando dónde estaba guardado originalmente
  saveUserToStorage(user: User): void {
    const isLocal = localStorage.getItem('user') !== null;
    const storage = isLocal ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(user));
  }

  logout(): void {
    this.http
      .post(
        `${this.apiUrl}/logout`,
        {},
        {
          withCredentials: true,
          responseType: 'text',
        },
      )
      .subscribe({
        next: () => this.limpiarSesionLocal(),
        error: (err) => {
          console.warn('Aviso al cerrar sesión en el backend:', err);
          this.limpiarSesionLocal();
        },
      });
  }

  private limpiarSesionLocal(): void {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    this.router.navigate(['/']);
  }

  getUserFromStorage(): string | null {
    return localStorage.getItem('user') || sessionStorage.getItem('user');
  }

  isLoggedIn(): boolean {
    return !!this.getUserFromStorage();
  }
}
