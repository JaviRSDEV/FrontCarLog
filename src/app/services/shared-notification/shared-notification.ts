import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedNotification {
  private vehicleRequestSource = new Subject<void>();

  vehicleRequest$ = this.vehicleRequestSource.asObservable();

  notifyVehicleRequest() {
    this.vehicleRequestSource.next();
  }
}
