import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workshop } from '../../models/workshop';

@Injectable({
  providedIn: 'root',
})

export class TallerService {

  private apiURL = 'http://localhost:8081/api/workshop';

  constructor(private http: HttpClient){}

  crearTaller(datosTaller: Workshop): Observable<Workshop>{
    return this.http.post<Workshop>(this.apiURL, datosTaller);
  }
}
