import { Injectable } from '@angular/core';
import { Observable, Subject, filter, map } from 'rxjs';

export enum AppEventType {
  RELOAD_VEHICLES,
  RELOAD_EMPLOYEES,
  NEW_INVITE,
}
@Injectable({
  providedIn: 'root',
})
export class NotificationBusService {
  private eventSubject = new Subject<AppEventType>();

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
