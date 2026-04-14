import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workshop } from '../../models/workshop';
import { User } from '../../models/user';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TallerService {
  private apiUrl = `${environment.apiUrl}/api/workshop`;

  constructor(private http: HttpClient) {}

  crearTaller(datosTaller: Workshop): Observable<Workshop> {
    return this.http.post<Workshop>(this.apiUrl, datosTaller);
  }

  getMecanicosPorTaller(workshopId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${workshopId}/employees`);
  }

  getTallerPorId(workshopId: number): Observable<Workshop> {
    return this.http.get<Workshop>(`${this.apiUrl}/details/${workshopId}`);
  }
}
