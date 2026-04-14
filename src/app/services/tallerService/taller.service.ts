import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workshop } from '../../models/workshop';

@Injectable({
  providedIn: 'root',
})
export class TallerService {
  private apiUrl = 'http://localhost:8081/api/workshop';

  constructor(private http: HttpClient) {}

  crearTaller(datosTaller: Workshop): Observable<Workshop> {
    return this.http.post<Workshop>(this.apiUrl, datosTaller);
  }

  getMecanicosPorTaller(workshopId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${workshopId}/employees`);
  }

  getTallerPorId(workshopId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/details/${workshopId}`);
  }
}
