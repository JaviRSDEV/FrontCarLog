import { Workshop } from './../../models/workshop';
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

  createVehicle(vehicle: Vehicle): Observable<Vehicle>{
    return this.http.post<Vehicle>(this.apiUrl, vehicle);
  }

  getVehicleInRepair(mechanicId: string): Observable<Vehicle[]>{
    return this.http.get<Vehicle[]>(`${this.apiUrl}/repairing?mechanicId=${mechanicId}`);
  }

  deleteVehicle(plate: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${plate}`,{
      responseType: 'text',
      withCredentials: true
    });
  }

  updateVehicle(plate: string, vehicleData: Vehicle): Observable<any> {
    return this.http.put(`${this.apiUrl}/${plate}`, vehicleData);
  }

  /*registerEntry(plate: string, workshopId: number){
    return this.http.put(`${this.apiUrl}/${plate}/entry/${workshopId}`, {});
  }*/

  registerExit(plate: string, workshopId: number){
    return this.http.post(`${this.apiUrl}/${plate}/exit/${workshopId}`, {}, {withCredentials: true});
  }

  requestEntry(plate: string, workshopId: number){
    return this.http.put(`${this.apiUrl}/${plate}/request-entry/${workshopId}`, {}, {withCredentials: true});
  }

  approveEntry(plate: string){
    return this.http.put(`${this.apiUrl}/${plate}/approve-entry`, {}, {withCredentials: true});
  }

  rejectEntry(plate: string){
    return this.http.put(`${this.apiUrl}/${plate}/reject-entry`, {}, {withCredentials: true});
  }
}

