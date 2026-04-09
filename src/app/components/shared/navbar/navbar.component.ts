import { NavigationEnd, Router } from '@angular/router';
import { Auth } from '../../../services/authService/auth.service';
import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

import { RxStomp } from '@stomp/rx-stomp';
import { myRxStompConfig } from '../../../config/rx-stomp-config';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  role: string = '';
  isManager = false;
  isMechanic = false;
  isClient = false;

  private rxStomp: RxStomp;
  private notificacionSubscription?: Subscription;

  constructor(
    private Auth: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.rxStomp = new RxStomp();
    this.rxStomp.configure(myRxStompConfig);
    this.rxStomp.activate();

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.comprobarEstado();
    });
  }

  ngOnInit() {
    this.comprobarEstado();
    this.escucharNotificaciones();
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

  escucharNotificaciones() {
    const userJson = localStorage.getItem('user');
    if (!userJson) return;

    const user = JSON.parse(userJson);
    const miDni = user.dni || user.userId || user.DNI;

    if (!miDni) return;

    this.notificacionSubscription = this.rxStomp
      .watch(`/topic/notificaciones/${miDni}`)
      .subscribe((message: any) => {
        const notification = JSON.parse(message.body);

        switch (notification.type) {
          case 'FIRE':
            console.warn(notification.title);
            this.ejecutarDespidoInmediato();
            break;

          case 'INVITE':
            console.log(notification.message);
            this.mostrarAlertaInvitacion(notification);
            break;

          case 'VEHICLE_REQUEST':
            console.log(notification.message);
            alert(
              `🚗 ${notification.title}\n${notification.message}\nVe a 'Mis Vehículos' para autorizar el ingreso.`,
            );
            break;

          default:
            console.log('Notificación recibida: ', notification);
        }
      });
  }

  mostrarAlertaInvitacion(notification: any) {
    alert(
      `🎉 ${notification.title}\n${notification.message}\nVe a tu Dashboard para aceptar o rechazar.`,
    );
  }

  ejecutarDespidoInmediato() {
    alert('Has sido despedido. Vuelve a iniciar sesión');
    this.Auth.logout();
  }

  cerrarSesion(): void {
    this.Auth.logout();
  }

  ngOnDestroy(): void {
    if (this.notificacionSubscription) {
      this.notificacionSubscription.unsubscribe();
    }
    this.rxStomp.deactivate();
  }
}
