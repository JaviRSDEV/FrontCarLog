import { Injectable } from '@angular/core';
import { Workorder } from '../../models/workorder';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkOrderService {
  private apiUrl = 'http://localhost:8081/api/workorders';

  constructor(private http: HttpClient) {}

  getWorkOrdersByMechanic(dni: string): Observable<Workorder[]> {
    console.log(`${this.apiUrl}/mechanic/${dni}`);
    return this.http.get<Workorder[]>(`${this.apiUrl}/mechanic/${dni}`);
  }

  getAllWorkOrders(id: number): Observable<Workorder[]> {
    return this.http.get<Workorder[]>(`${this.apiUrl}/workshop/${id}`);
  }

  getWorkOrderById(id: number): Observable<Workorder> {
    const url = `${this.apiUrl}/${id}`;
    console.log('--- LLAMADA REAL A:', url);
    return this.http.get<Workorder>(url);
    /*console.log('Intentado GET a:', this.apiUrl);
    return this.http.get<Workorder>(`${this.apiUrl}/${id}`);*/
  }

  createWorkOrder(workOrderData: {
    description: string;
    vehiclePlate: string;
  }): Observable<Workorder> {
    return this.http.post<Workorder>(this.apiUrl, workOrderData);
  }

  updateWorkOrder(
    id: number,
    updateData: { mechanicNotes?: string; status?: string },
  ): Observable<Workorder> {
    return this.http.put<Workorder>(`${this.apiUrl}/${id}`, updateData);
  }

  deleteWorkOrder(id: number): Observable<Workorder> {
    return this.http.delete<Workorder>(`${this.apiUrl}/${id}`);
  }

  addWorkOrderLine(
    orderId: number,
    lineData: {
      concept: string;
      quantity: number;
      pricePerUnit: number;
      IVA: number;
      discount: number;
    },
  ): Observable<Workorder> {
    return this.http.post<Workorder>(`${this.apiUrl}/${orderId}/lines`, lineData);
  }

  deleteWorkOrderLine(orderId: number, lineId: number): Observable<Workorder> {
    return this.http.delete<Workorder>(`${this.apiUrl}/${orderId}/lines/${lineId}`);
  }

  updateWorkOrderLine(orderId: number, lineId: number, lineData: any): Observable<Workorder> {
    return this.http.put<Workorder>(`${this.apiUrl}/${orderId}/lines/${lineId}`, lineData);
  }

  reassignWorkOrder(orderId: number, newMechanicId: string): Observable<Workorder> {
    return this.http.patch<Workorder>(
      `${this.apiUrl}/${orderId}/reassign?newMechanicId=${newMechanicId}`,
      {},
    );
  }
}
