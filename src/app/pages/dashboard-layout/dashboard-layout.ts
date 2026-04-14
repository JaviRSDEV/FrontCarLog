import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../components/shared/navbar/navbar.component';
import { Header } from '../../components/shared/header/header.component';
import { Footer } from '../../components/shared/footer/footer.component';

import { Subscription } from 'rxjs';
import { RxStomp } from '@stomp/rx-stomp';
import { myRxStompConfig } from '../../config/rx-stomp-config';
import { Auth } from '../../services/authService/auth.service';
import Swal from 'sweetalert2';

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

  constructor(private Auth: Auth) {
    this.rxStomp = new RxStomp();
    this.rxStomp.configure(myRxStompConfig);
    this.rxStomp.activate();
  }

  ngOnInit() {
    this.escucharNotificaciones();
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
              this.Auth.logout();
            });
            break;

          case 'INVITE':
            console.log('Layout: Invitación recibida');
            window.dispatchEvent(new CustomEvent('nueva-invitacion'));

            Swal.fire({
              title: notification.title,
              text: `${notification.message} Ve a tu Dashboard para responder.`,
              icon: 'info',
              background: '#212529',
              color: '#fff',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 5000,
              timerProgressBar: true,
            });
            break;

          case 'VEHICLE_REQUEST':
            console.log('Layout: Solicitud de vehículo recibida');
            window.dispatchEvent(new CustomEvent('recargar-coches'));

            Swal.fire({
              title: notification.title,
              text: `${notification.message} Ve a 'Mis Vehículos' para autorizar el ingreso.`,
              icon: 'info',
              background: '#212529',
              color: '#fff',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 5000,
              timerProgressBar: true,
            });
            break;

          case 'NEW_EMPLOYEE':
            console.log('Layout: Nuevo empleado en el taller');
            window.dispatchEvent(new CustomEvent('recargar-empleados'));
            break;

          case 'NEW_FLEET_VEHICLE':
            console.log('Layout: Coche nuevo en el taller');
            window.dispatchEvent(new CustomEvent('recargar-coches'));
            break;

          default:
            console.log('Notificación recibida: ', notification);
        }
      });
  }

  ngOnDestroy(): void {
    if (this.notificacionSubscription) {
      this.notificacionSubscription.unsubscribe();
    }
    this.rxStomp.deactivate();
  }
}
