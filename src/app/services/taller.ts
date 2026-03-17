import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class Taller {

  private apiURL = 'http://localhost:8081/api/workshop';

  constructor(private http: HttpClient){}

  crearTaller(datosTaller: any): Observable<any>{
    return this.http.post(this.apiURL, datosTaller);
  }
}
