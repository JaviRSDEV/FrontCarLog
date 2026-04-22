import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Auth } from '../../../services/authService/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  private authService = inject(Auth);
  private router = inject(Router);
  private destroy$ = inject(DestroyRef);

  role = signal<string>('');

  isManager = computed(() => this.role() === 'MANAGER' || this.role() === 'CO_MANAGER');
  isMechanic = computed(() => this.role() === 'MECHANIC');
  isClient = computed(() => this.role() === 'CLIENT');

  isLoggedIn = computed(() => this.role() !== '');

  ngOnInit() {
    this.comprobarEstado();
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroy$),
      )
      .subscribe(() => {
        this.comprobarEstado();
      });
  }

  comprobarEstado() {
    const userJson = this.authService.getUserFromStorage();

    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        const roleParsed = (user.role || '').toString().replace(/"/g, '').toUpperCase();

        if (this.role() !== roleParsed) {
          this.role.set(roleParsed);
        }
      } catch (error) {
        console.error('Error al parsear el usuario en Navbar:', error);
        this.resetVariables();
      }
    } else {
      this.resetVariables();
    }
  }

  private resetVariables() {
    this.role.set('');
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.resetVariables();
  }
}
