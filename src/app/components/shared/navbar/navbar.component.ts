import { Router } from '@angular/router';
import { Auth } from '../../../services/authService/auth.service';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  role: string = '';
  isManager = false;
  isMechanic = false;

  constructor(
    private Auth: Auth,
    private router: Router,
  ) {
    this.router.events.subscribe(() => {
      this.comprobarEstado();
    });
  }
  ngOnInit() {
    this.comprobarEstado();
  }

  comprobarEstado() {
    let userJson = localStorage.getItem('user');
    console.log(userJson);

    if (!userJson) {
      const cookieMatch = document.cookie.match(/(^|;)\s*user_data\s*=\s*([^;]+)/);
      if (cookieMatch) userJson = decodeURIComponent(cookieMatch[2]);
    }

    if (userJson) {
      const user = JSON.parse(userJson);

      this.role = user.role?.replace(/"/g, '').toUpperCase();

      this.isManager = this.role === 'MANAGER' || this.role === 'CO_MANAGER';

      this.isMechanic = this.role === 'MECHANIC';

      this.isManager = user.role === 'MANAGER' && !user.workShop;

      console.log(this.isManager);
    }
  }

  cerrarSesion(): void {
    this.Auth.logout();
  }
}
