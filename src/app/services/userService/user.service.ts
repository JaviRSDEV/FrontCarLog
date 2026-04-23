import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { User } from '../../models/user';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/users`;

  getUserByDni(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  edit(userData: User, dni: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${dni}`, userData);
  }

  contratarEmpleados(managerDni: string, employeeDni: string, newRole: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/promote`, null, {
      params: { managerDni, employeeDni, newRole },
    });
  }

  invite(dni: string, managerDni: string, newRole: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${dni}/invite`, null, {
      params: { managerDni, newRole },
      withCredentials: true,
    });
  }

  acceptInvitation(dni: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/accept`, {});
  }

  rejectInvitation(dni: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/reject`, {});
  }

  fireEmployee(dni: string): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/${dni}/fire`,
      {},
      {
        withCredentials: true,
      },
    );
  }
}
