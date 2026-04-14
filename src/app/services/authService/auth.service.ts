import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../../models/user';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = 'http://localhost:8081/api/auth';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(credentials: { email?: string; password?: string; dni?: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/authenticate`, credentials, {
      withCredentials: true,
    });
  }

  register(userData: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, userData, { withCredentials: true });
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
