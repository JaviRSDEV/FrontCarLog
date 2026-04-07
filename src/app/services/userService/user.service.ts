import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:8081/api/workshop';

  constructor(private http: HttpClient) {}

  getMecanicosPorTaller(workshopId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${workshopId}/employees`);
  }
}
