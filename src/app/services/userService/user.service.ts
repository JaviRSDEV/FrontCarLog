import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../../models/user';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  getUserByDni(dni: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${dni}`);
  }

  edit(userData: User, dni: string): Observable<User> {
    const url = `${this.apiUrl}/${dni}`;
    return this.http.put<User>(url, userData);
  }

  contratarEmpleados(managerDni: string, employeeDni: string, newRole: string): Observable<User> {
    const params = new HttpParams()
      .set('managerDni', managerDni)
      .set('employeeDni', employeeDni)
      .set('newRole', newRole);

    return this.http.patch<User>(`${this.apiUrl}/promote`, null, { params });
  }

  invite(dni: string, managerDni: string, newRole: string): Observable<User> {
    const params = new HttpParams().set('managerDni', managerDni).set('newRole', newRole);

    return this.http.patch<User>(`${this.apiUrl}/${dni}/invite`, null, {
      params,
      withCredentials: true,
    });
  }

  acceptInvitation(dni: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${dni}/accept`, {});
  }

  rejectInvitation(dni: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${dni}/reject`, {});
  }

  fireEmployee(dni: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${dni}/fire`, {}, { withCredentials: true });
  }
}
