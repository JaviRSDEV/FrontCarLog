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
    private authService: Auth,
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
    const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (userJson) {
      try {
        const user = JSON.parse(userJson);

        this.role = (user.role || '').toString().replace(/"/g, '').toUpperCase();

        this.isManager = this.role === 'MANAGER' || this.role === 'CO_MANAGER';
        this.isMechanic = this.role === 'MECHANIC';
        this.isClient = this.role === 'CLIENT';

        console.log('Navbar - Rol detectado:', this.role);
      } catch (error) {
        console.error('Error al parsear el usuario:', error);
        this.resetVariables();
      }
    } else {
      this.resetVariables();
    }

    this.cdr.detectChanges();
  }

  private resetVariables() {
    this.role = '';
    this.isManager = false;
    this.isMechanic = false;
    this.isClient = false;
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}
