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

  cargarDatosUsuario() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const localUser = JSON.parse(userJson);
      const dniBuscado = localUser.dni;

      if (dniBuscado) {
        this.userService.getUserByDni(dniBuscado).subscribe({
          next: (fullUser: User) => {
            setTimeout(() => {
              this.user = fullUser;
              this.role = this.user.role;

              if (this.user.workShop) {
                this.workshop =
                  typeof this.user.workShop === 'string'
                    ? this.user.workShop
                    : this.user.workShop.workshopName;
              }

              localStorage.setItem('user', JSON.stringify(this.user));
              this.cdr.detectChanges();
            }, 0);
          },
          error: (err: HttpErrorResponse) => console.error(err),
        });
      }
    }

    let token = sessionStorage.getItem('auth_token');

    if (!token) {
      const cookieMatch = document.cookie.match(/(^|;)\s*auth_token\s*=\s*([^;]+)/);
      if (cookieMatch) {
        token = cookieMatch[2];
      }
    }

    if (token) {
      try {
        let base64Url = token.split('.')[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        let tokenPayload = JSON.parse(atob(base64));

        if (tokenPayload.sub) {
          this.userName = tokenPayload.sub.split('@')[0];
        }
      } catch (error) {
        console.error(error);
        this.userName = 'Usuario';
      }
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

          if (res.workShop) {
            this.workshop =
              typeof res.workShop === 'string' ? res.workShop : res.workShop.workshopName;
          } else {
            this.workshop = '';
          }
        }

        this.user = res;

        localStorage.setItem('user', JSON.stringify(this.user));
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al gestionar invitación', err);
      },
    });
  }
}
