import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit{

  isManager = false;

  ngOnInit() {
    this.comprobarEstado();

  }

  comprobarEstado(){
    let userJson = sessionStorage.getItem('user');
    console.log(userJson);
    if(!userJson){
      const cookieMatch = document.cookie.match(/(^|;)\s*user_data\s*=\s*([^;]+)/);
      if(cookieMatch) userJson = decodeURIComponent(cookieMatch[2]);
    }

    if(userJson){
      const user = JSON.parse(userJson);

      this.isManager = user.role === 'MANAGER' && !user.workshop?.workshopName;

      console.log(this.isManager);
    }
  }
}
