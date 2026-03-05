import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl =  'http://localhost:8081/api/auth'

  constructor(private http: HttpClient){ }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/authenticate`, credentials);
  }

  register(userData: any): Observable<any>{
    return this.http.post(`${this.apiUrl}/register`, userData)
  }
}
