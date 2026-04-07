import { UserService } from './../../../services/userService/user.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard.component',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  userName: string = 'Usuario';
  role: string = '';
  workshop: string = '';
  user: any;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const localUser = JSON.parse(userJson);
      const dniBuscado = localUser.dni;

      if (dniBuscado) {
        this.userService.getUserByDni(dniBuscado).subscribe({
          next: (fullUser: any) => {
            setTimeout(() => {
              this.user = fullUser;
              this.role = this.user.role;

              if (this.user.workShop) {
                this.workshop = this.user.workShop;
              }

              localStorage.setItem('user', JSON.stringify(this.user));

              this.cdr.detectChanges();
            }, 0);
          },
          error: (err) => console.error(err),
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
    const accion = aceptar
      ? this.userService.acceptInvitation(this.user.dni)
      : this.userService.rejectInvitation(this.user.dni);

    accion.subscribe({
      next: (res: any) => {
        if (aceptar) {
          alert('¡Invitación aceptada! Actualizando permisos...');
          window.location.reload();
        } else {
          this.user.pendingWorkshopName = null;
          this.user.pendingRole = null;
          localStorage.setItem('user', JSON.stringify(this.user));
        }
      },
      error: (err: any) => console.error('Error al gestionar invitación', err),
    });
  }
}
