import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Workshop } from '../../models/workshop';
import { User } from '../../models/user';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class TallerService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/workshop`;

  crearTaller(taller: Partial<Workshop>): Observable<Workshop> {
    return this.http.post<Workshop>(`${this.apiUrl}/create`, taller, {
      withCredentials: true,
    });
  }

  getMecanicosPorTaller(workshopId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${workshopId}/employees`);
  }

  getTallerPorId(workshopId: number): Observable<Workshop> {
    return this.http.get<Workshop>(`${this.apiUrl}/details/${workshopId}`);
  }

  actualizarTaller(workshopId: number, datosTaller: Workshop): Observable<Workshop> {
    return this.http.put<Workshop>(`${this.apiUrl}/details/${workshopId}`, datosTaller);
  }

  actualizarTallerConFoto(workshopId: number, formData: FormData): Observable<Workshop> {
    return this.http.put<Workshop>(`${this.apiUrl}/details/${workshopId}`, formData);
  }
}
