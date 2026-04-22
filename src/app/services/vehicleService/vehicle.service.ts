import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Page } from '../../models/page.model';
import { Vehicle } from '../../models/vehicle';
import { Workorder } from '../../models/workorder';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/vehicles`;

  getVehiclesByWorkshop(
    workshopId: number,
    page: number = 0,
    size: number = 10,
  ): Observable<Page<Vehicle>> {
    return this.http.get<Page<Vehicle>>(this.apiUrl, {
      params: { workshopId, page, size },
    });
  }

  getVehiclesByOwner(
    ownerId: string,
    page: number = 0,
    size: number = 10,
  ): Observable<Page<Vehicle>> {
    return this.http.get<Page<Vehicle>>(this.apiUrl, {
      params: { ownerId, page, size },
    });
  }

  getAllVehicles(page: number = 0, size: number = 10): Observable<Page<Vehicle>> {
    return this.http.get<Page<Vehicle>>(this.apiUrl, {
      params: { page, size },
    });
  }

  createVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.apiUrl, vehicle);
  }

  getVehicleInRepair(
    mechanicId: string,
    page: number = 0,
    size: number = 10,
  ): Observable<Page<Vehicle>> {
    return this.http.get<Page<Vehicle>>(`${this.apiUrl}/repairing`, {
      params: { mechanicId, page, size },
    });
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

  getHistoryByPlate(
    plate: string,
    page: number = 0,
    size: number = 10,
  ): Observable<Page<Workorder>> {
    return this.http.get<Page<Workorder>>(`${this.apiUrl}/${plate}/history`, {
      params: { page, size },
    });
  }

  searchVehicles(
    q: string,
    workshopId: number,
    type: string,
    page: number = 0,
    size: number = 10,
  ): Observable<Page<Vehicle>> {
    return this.http.get<Page<Vehicle>>(`${this.apiUrl}/search`, {
      params: { q, workshopId, type, page, size },
    });
  }
}
