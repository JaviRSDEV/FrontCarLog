import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../components/shared/navbar/navbar.component';
import { Header } from '../../components/shared/header/header.component';
import { Footer } from '../../components/shared/footer/footer.component';

import { Subscription } from 'rxjs';
import { RxStomp } from '@stomp/rx-stomp';
import { IMessage } from '@stomp/stompjs';
import { myRxStompConfig } from '../../config/rx-stomp-config';
import { Auth } from '../../services/authService/auth.service';
import { User } from '../../models/user';
import Swal from 'sweetalert2';

interface AppNotification {
  type: 'FIRE' | 'INVITE' | 'VEHICLE_REQUEST' | 'NEW_EMPLOYEE' | 'NEW_FLEET_VEHICLE';
  title?: string;
  message?: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar, Header, Footer],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout implements OnInit, OnDestroy {
  private rxStomp: RxStomp;
  private notificacionSubscription?: Subscription;

  constructor(private authService: Auth) {
    this.rxStomp = new RxStomp();
    this.rxStomp.configure(myRxStompConfig);
    this.rxStomp.activate();
  }

  ngOnInit() {
    this.escucharNotificaciones();
  }

  escucharNotificaciones() {
    const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (!userJson) return;

    try {
      const user: User = JSON.parse(userJson);
      const miDni = user.dni;

      if (!miDni) return;

      this.notificacionSubscription = this.rxStomp
        .watch(`/topic/notificaciones/${miDni}`)
        .subscribe((message: IMessage) => {
          const notification: AppNotification = JSON.parse(message.body);

          switch (notification.type) {
            case 'FIRE':
              console.warn(notification.title);
              Swal.fire({
                title: notification.title || '¡Atención!',
                text: 'Has sido dado de baja del taller. Vuelve a iniciar sesión.',
                icon: 'error',
                background: '#212529',
                color: '#fff',
                confirmButtonColor: '#dc3545',
                confirmButtonText: 'Cerrar sesión',
                allowOutsideClick: false,
              }).then(() => {
                this.authService.logout();
              });
              break;

            case 'INVITE':
              window.dispatchEvent(new CustomEvent('nueva-invitacion'));
              this.mostrarToast(notification);
              break;

            case 'VEHICLE_REQUEST':
              window.dispatchEvent(new CustomEvent('recargar-coches'));
              this.mostrarToast(notification, "Ve a 'Mis Vehículos' para autorizar el ingreso.");
              break;

            case 'NEW_EMPLOYEE':
              window.dispatchEvent(new CustomEvent('recargar-empleados'));
              break;

            case 'NEW_FLEET_VEHICLE':
              window.dispatchEvent(new CustomEvent('recargar-coches'));
              break;

            default:
              console.log('Notificación recibida: ', notification);
          }
        });
    } catch (e) {
      console.error('Error al iniciar suscripción de notificaciones:', e);
    }
  }

  private mostrarToast(notification: AppNotification, extraMsg: string = '') {
    Swal.fire({
      title: notification.title,
      text: `${notification.message} ${extraMsg}`,
      icon: 'info',
      background: '#212529',
      color: '#fff',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
    });
  }

  ngOnDestroy(): void {
    if (this.notificacionSubscription) {
      this.notificacionSubscription.unsubscribe();
    }
    this.rxStomp.deactivate();
  }
}
