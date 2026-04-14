import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicle } from '../../models/vehicle';
import { Workorder } from '../../models/workorder';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private apiUrl = 'http://localhost:8081/api/vehicles';

  constructor(private http: HttpClient) {}

  getVehiclesByWorkshop(workshopId: number): Observable<Vehicle[]> {
    const params = new HttpParams().set('workshopId', workshopId.toString());
    return this.http.get<Vehicle[]>(this.apiUrl, { params });
  }

  getVehiclesByOwner(ownerId: string): Observable<Vehicle[]> {
    const params = new HttpParams().set('ownerId', ownerId);
    return this.http.get<Vehicle[]>(this.apiUrl, { params });
  }

  getAllVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.apiUrl);
  }

  createVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.apiUrl, vehicle);
  }

  getVehicleInRepair(mechanicId: string): Observable<Vehicle[]> {
    const params = new HttpParams().set('mechanicId', mechanicId);
    return this.http.get<Vehicle[]>(`${this.apiUrl}/repairing`, { params });
  }

  deleteVehicle(plate: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${plate}`, {
      responseType: 'text',
    });
  }

  updateVehicle(plate: string, vehicleData: Vehicle): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.apiUrl}/${plate}`, vehicleData);
  }

  registerExit(plate: string, workshopId: number): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.apiUrl}/${plate}/exit/${workshopId}`, {});
  }

  requestEntry(plate: string, workshopId: number): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.apiUrl}/${plate}/request-entry/${workshopId}`, {});
  }

  approveEntry(plate: string): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.apiUrl}/${plate}/approve-entry`, {});
  }

  rejectEntry(plate: string): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.apiUrl}/${plate}/reject-entry`, {});
  }

  getHistoryByPlate(plate: string): Observable<Workorder[]> {
    return this.http.get<Workorder[]>(`${this.apiUrl}/${plate}/history`);
  }

  searchVehicles(q: string, workshopId: number, type: string): Observable<Vehicle[]> {
    const params = new HttpParams()
      .set('q', q)
      .set('workshopId', workshopId.toString())
      .set('type', type);

    return this.http.get<Vehicle[]>(`${this.apiUrl}/search`, { params });
  }
}
