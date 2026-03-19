import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicle } from '../../models/vehicle';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {

  private apiUrl = 'http://localhost:8081/api/vehicles';

  constructor(private http: HttpClient){}

  getVehiclesByWorkshop(workshopId: number): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}?workshopId=${workshopId}`);
  }

  getVehiclesByOwner(ownerId: string): Observable<Vehicle[]>{
    return this.http.get<Vehicle[]>(`${this.apiUrl}?ownerId=${ownerId}`);
  }

  getAllVehicles(): Observable<Vehicle[]>{
    return this.http.get<Vehicle[]>(this.apiUrl);
  }
}
