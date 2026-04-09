import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../components/shared/navbar/navbar.component';
import { Header } from '../../components/shared/header/header.component';
import { Footer } from '../../components/shared/footer/footer.component';

import { Subscription } from 'rxjs';
import { RxStomp } from '@stomp/rx-stomp';
import { myRxStompConfig } from '../../config/rx-stomp-config';
import { Auth } from '../../services/authService/auth.service';

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
            alert('Has sido despedido. Vuelve a iniciar sesión');
            this.Auth.logout();
            break;

          case 'INVITE':
            console.log('Layout: Invitación recibida');
            window.dispatchEvent(new CustomEvent('nueva-invitacion'));

            setTimeout(() => {
              alert(
                `${notification.title}\n${notification.message}\nVe a tu Dashboard para aceptar o rechazar.`,
              );
            }, 100);

            break;

          case 'VEHICLE_REQUEST':
            console.log('Layout: Solicitud de vehículo recibida');
            window.dispatchEvent(new CustomEvent('recargar-coches'));

            setTimeout(() => {
              alert(
                `${notification.title}\n${notification.message}\nVe a 'Mis Vehículos' para autorizar el ingreso.`,
              );
            }, 100);

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
