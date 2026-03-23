import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { User } from '../../../models/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard.component',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit{

  userName: string = 'Usuario';
  role: string = '';
  workshopName: string = '';

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario(){
    const userJson = localStorage.getItem('user');
    if(userJson){
      const user: User = JSON.parse(userJson);

      this.role = user.role;

      if(user.workshop?.workshopName){
        this.workshopName = user.workshop.workshopName;
      }
    }

    let token = sessionStorage.getItem('auth_token');

    if(!token){
      const cookieMatch = document.cookie.match(/(^|;)\s*auth_token\s*=\s*([^;]+)/);
      if(cookieMatch){
        token = cookieMatch[2];
      }
    }

    if(token){
      try{
        let base64Url = token.split('.')[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        let tokenPayload = JSON.parse(atob(base64))

        if(tokenPayload.sub){
          this.userName = tokenPayload.sub.split('@')[0];
        }
      }catch(error){
        console.error(error);
        this.userName = 'Usuario';
      }
    }
  }
}
