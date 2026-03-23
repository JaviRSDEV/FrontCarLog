import { Injectable } from '@angular/core';
import { Workorder } from '../../models/workorder';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkOrderService {
  private apiUrl = 'http://localhost:8081/api/workoders';

  constructor(private http: HttpClient){}

  getWorkOrdersByMechanic(dni: string): Observable<Workorder[]>{
    return this.http.get<Workorder[]>(`${this.apiUrl}?mechanicDni=${dni}`)
  }
}
