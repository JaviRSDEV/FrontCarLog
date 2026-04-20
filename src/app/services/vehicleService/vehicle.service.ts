import { Page } from './../../models/page.model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicle } from '../../models/vehicle';
import { Workorder } from '../../models/workorder';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private apiUrl = `${environment.apiUrl}/vehicles`;

  constructor(private http: HttpClient) {}

  getVehiclesByWorkshop(
    workshopId: number,
    page: number = 0,
    size: number = 10,
  ): Observable<Page<Vehicle>> {
    const params = new HttpParams()
      .set('workshopId', workshopId.toString())
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Vehicle>>(this.apiUrl, { params });
  }

  getVehiclesByOwner(
    ownerId: string,
    page: number = 0,
    size: number = 10,
  ): Observable<Page<Vehicle>> {
    const params = new HttpParams()
      .set('ownerId', ownerId)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Vehicle>>(this.apiUrl, { params });
  }

  getAllVehicles(page: number = 0, size: number = 10): Observable<Page<Vehicle>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<Page<Vehicle>>(this.apiUrl, { params });
  }

  createVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.apiUrl, vehicle);
  }

  getVehicleInRepair(
    mechanicId: string,
    page: number = 0,
    size: number = 10,
  ): Observable<Page<Vehicle>> {
    const params = new HttpParams()
      .set('mechanicId', mechanicId)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Vehicle>>(`${this.apiUrl}/repairing`, { params });
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

  // OJO: Si paginaste el historial en el backend, esto también devolvería Page<Workorder>
  // Lo dejo como estaba (Workorder[]) asumiendo que aún no lo has tocado en tu WorkOrderService de Angular
  getHistoryByPlate(plate: string): Observable<Workorder[]> {
    return this.http.get<Workorder[]>(`${this.apiUrl}/${plate}/history`);
  }

  searchVehicles(
    q: string,
    workshopId: number,
    type: string,
    page: number = 0,
    size: number = 10,
  ): Observable<Page<Vehicle>> {
    const params = new HttpParams()
      .set('q', q)
      .set('workshopId', workshopId.toString())
      .set('type', type)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Vehicle>>(`${this.apiUrl}/search`, { params });
  }
}
