import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:8081/api/users';

  constructor(private http: HttpClient) {}

  getUserByDni(dni: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${dni}`);
  }

  edit(userData: any, dni: string): Observable<any> {
    const url = `${this.apiUrl}/${dni}`;

    return this.http.put<any>(url, userData);
  }

  contratarEmpleados(managerDni: string, employeeDni: string, newRole: string): Observable<any> {
    const params = {
      managerDni: managerDni,
      employeeDni: employeeDni,
      newRole: newRole,
    };

    return this.http.patch(`${this.apiUrl}/promote`, null, { params });
  }

  invite(dni: string, managerDni: string, newRole: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${dni}/invite?managerDni=${managerDni}&newRole=${newRole}`,
      null,
      { withCredentials: true },
    );
  }

  acceptInvitation(dni: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${dni}/accept`, {});
  }

  rejectInvitation(dni: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${dni}/reject`, {});
  }

  fireEmployee(dni: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${dni}/fire`, {}, { withCredentials: true });
  }
}
