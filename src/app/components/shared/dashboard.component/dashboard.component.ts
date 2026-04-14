import { UserService } from './../../../services/userService/user.service';
import { ChangeDetectorRef, Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user';
import { HttpErrorResponse } from '@angular/common/http';

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

  private invitacionListener = () => {
    this.ngZone.run(() => {
      setTimeout(() => {
        this.cargarDatosUsuario();
      }, 500);
    });
  };

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.cargarDatosUsuario();
    window.addEventListener('nueva-invitacion', this.invitacionListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('nueva-invitacion', this.invitacionListener);
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
        res.pendingWorkshopName = null;
        res.pendingRole = null;

        if (aceptar) {
          this.role = res.role;
          if (res.workshop) {
            this.workshop =
              typeof res.workshop === 'string' ? res.workshop : res.workshop.workshopName;
          } else {
            this.workshop = '';
          }
        }

        this.user = res;
        this.userName = this.user.name || this.user.email.split('@')[0];

        this.getStorage().setItem('user', JSON.stringify(this.user));
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al gestionar invitación', err);
      },
    });
  }
}
