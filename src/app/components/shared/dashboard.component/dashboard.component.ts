import { UserService } from './../../../services/userService/user.service';
import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AppEventType,
  NotificationBusService,
} from '../../../services/notification-bus/notification-bus.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard.component',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  userName: string = 'Usuario';
  role: string = '';
  workshop: string = '';
  user?: User;

  mostrarAvisoFeedBack: boolean = false;
  mensajeAviso: string = '';
  tipoAviso: 'success' | 'danger' | 'info' = 'info';

  private eventSub!: Subscription;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private notificationBus: NotificationBusService,
  ) {}

  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.eventSub = this.notificationBus.on(AppEventType.NEW_INVITE).subscribe(() => {
      this.cargarDatosUsuario();
    });
  }

  ngOnDestroy(): void {
    if (this.eventSub) {
      this.eventSub.unsubscribe();
    }
  }

  private getStorage() {
    return localStorage.getItem('user') !== null ? localStorage : sessionStorage;
  }

  cargarDatosUsuario() {
    const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userJson) return;

    const localUser = JSON.parse(userJson);
    const dniBuscado = localUser.dni;

    if (dniBuscado) {
      this.userService.getUserByDni(dniBuscado).subscribe({
        next: (fullUser: User) => {
          this.user = fullUser;
          this.role = this.user.role;
          this.userName = this.user.name || this.user.email.split('@')[0];

          if (this.user.workshop) {
            this.workshop =
              typeof this.user.workshop === 'string'
                ? this.user.workshop
                : this.user.workshop.workshopName;
          }

          this.getStorage().setItem('user', JSON.stringify(this.user));
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error al cargar datos del usuario:', err);
        },
      });
    }
  }

  gestionarInvitacion(aceptar: boolean) {
    if (!this.user || !this.user.dni) return;

    const accion = aceptar
      ? this.userService.acceptInvitation(this.user.dni)
      : this.userService.rejectInvitation(this.user.dni);

    accion.subscribe({
      next: (res: User) => {
        const updatedUser = { ...res };

        (updatedUser as any).pendingWorkshop = undefined;
        (updatedUser as any).pendingWorkshopName = undefined;
        (updatedUser as any).pendingRole = undefined;

        this.user = updatedUser;

        if (aceptar) {
          this.role = this.user.role;
          if (this.user.workshop) {
            this.workshop =
              typeof this.user.workshop === 'string'
                ? this.user.workshop
                : this.user.workshop.workshopName;
          }
          this.mensajeAviso = '¡Te has unido al taller!';
          this.tipoAviso = 'success';
        } else {
          this.mensajeAviso = 'Invitación rechazada.';
          this.tipoAviso = 'info';
        }

        this.getStorage().setItem('user', JSON.stringify(this.user));

        this.mostrarAvisoFeedBack = true;

        this.cdr.markForCheck();
        this.cdr.detectChanges();

        setTimeout(() => {
          this.mostrarAvisoFeedBack = false;
          this.cdr.detectChanges();
        }, 5000);
      },
      error: (err) => {
        console.error(err);
        this.mensajeAviso = 'Error al procesar la invitación.';
        this.tipoAviso = 'danger';
        this.mostrarAvisoFeedBack = true;
        this.cdr.detectChanges();
      },
    });
  }
}
