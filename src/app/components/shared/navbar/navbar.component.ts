import { NavigationEnd, Router } from '@angular/router';
import { Auth } from '../../../services/authService/auth.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  role: string = '';
  isManager = false;
  isMechanic = false;
  isClient = false;

  constructor(
    private Auth: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.comprobarEstado();
    });
  }

  ngOnInit() {
    this.comprobarEstado();
  }

  comprobarEstado() {
    let userJson = localStorage.getItem('user');

    if (!userJson) {
      const cookieMatch = document.cookie.match(/(^|;)\s*user_data\s*=\s*([^;]+)/);
      if (cookieMatch) userJson = decodeURIComponent(cookieMatch[2]);
    }

    if (userJson) {
      const user = JSON.parse(userJson);

      this.role = user.role?.replace(/"/g, '').toUpperCase();
      this.isManager = this.role === 'MANAGER' || this.role === 'CO_MANAGER';
      this.isMechanic = this.role === 'MECHANIC';
      this.isClient = this.role === 'CLIENT';
    } else {
      this.role = '';
      this.isManager = false;
      this.isMechanic = false;
      this.isClient = false;
    }

    this.cdr.detectChanges();
  }

  cerrarSesion(): void {
    this.Auth.logout();
  }
}
