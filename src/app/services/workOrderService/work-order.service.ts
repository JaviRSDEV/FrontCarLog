import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';
import { Workorder, CreateWorkOrderDto, UpdateWorkOrderDto } from '../../models/workorder';
import { CreateWorkOrderLineDto } from '../../models/workorderline';
import { WorkOrderLine } from '../../models/workorderline';

@Injectable({
  providedIn: 'root',
})
export class WorkOrderService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/workorders`;

  getWorkOrdersByMechanic(dni: string): Observable<Workorder[]> {
    return this.http.get<Workorder[]>(`${this.apiUrl}/mechanic/${dni}`);
  }

  getAllWorkOrders(id: number): Observable<Workorder[]> {
    return this.http.get<Workorder[]>(`${this.apiUrl}/workshop/${id}`);
  }

  getWorkOrderById(id: number): Observable<Workorder> {
    return this.http.get<Workorder>(`${this.apiUrl}/${id}`);
  }

  createWorkOrder(workOrderData: CreateWorkOrderDto): Observable<Workorder> {
    return this.http.post<Workorder>(this.apiUrl, workOrderData);
  }

  updateWorkOrder(id: number, updateData: UpdateWorkOrderDto): Observable<Workorder> {
    return this.http.put<Workorder>(`${this.apiUrl}/${id}`, updateData);
  }

  deleteWorkOrder(id: number): Observable<Workorder> {
    return this.http.delete<Workorder>(`${this.apiUrl}/${id}`);
  }

  addWorkOrderLine(orderId: number, lineData: CreateWorkOrderLineDto): Observable<Workorder> {
    return this.http.post<Workorder>(`${this.apiUrl}/${orderId}/lines`, lineData);
  }

  deleteWorkOrderLine(orderId: number, lineId: number): Observable<Workorder> {
    return this.http.delete<Workorder>(`${this.apiUrl}/${orderId}/lines/${lineId}`);
  }

  updateWorkOrderLine(
    orderId: number,
    lineId: number,
    lineData: Partial<WorkOrderLine>,
  ): Observable<Workorder> {
    return this.http.put<Workorder>(`${this.apiUrl}/${orderId}/lines/${lineId}`, lineData);
  }

  reassignWorkOrder(orderId: number, newMechanicId: string): Observable<Workorder> {
    const params = new HttpParams().set('newMechanicId', newMechanicId);
    return this.http.patch<Workorder>(`${this.apiUrl}/${orderId}/reassign`, {}, { params });
  }
}
