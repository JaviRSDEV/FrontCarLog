import { Injectable } from '@angular/core';
import { Observable, Subject, filter, map } from 'rxjs';

export enum AppEventType {
  RELOAD_VEHICLES = 'RELOAD_VEHICLES',
  RELOAD_EMPLOYEES = 'RELOAD_EMPLOYEES',
  NEW_INVITE = 'NEW_INVITE',
  VEHICLE_REQUEST = 'VEHICLE_REQUEST',
}

@Injectable({
  providedIn: 'root',
})
export class NotificationBusService {
  private readonly eventSubject = new Subject<AppEventType>();

  emit(event: AppEventType): void {
    this.eventSubject.next(event);
  }

  on(eventType: AppEventType): Observable<void> {
    return this.eventSubject.asObservable().pipe(
      filter((e) => e === eventType),
      map(() => void 0),
    );
  }
}
