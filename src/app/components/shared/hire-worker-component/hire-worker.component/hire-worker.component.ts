import { UserService } from './../../../../services/userService/user.service';
import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hire-worker',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './hire-worker.component.html',
  styleUrl: './hire-worker.component.css',
})
export class HireWorkerComponent {
  dniBusqueda: string = '';
  rolElegido: string = 'MECHANIC';
  mensaje: string = '';
  error: boolean = false;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
  ) {}

  enviarInvitacion() {
    const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (!userJson) {
      this.mensaje = 'Error de sesión: No se pudo identificar al administrador.';
      this.error = true;
      return;
    }

    try {
      const manager = JSON.parse(userJson);
      const managerDni = manager.dni;

      if (!managerDni) {
        this.mensaje = 'Error: Tus datos de administrador no incluyen DNI.';
        this.error = true;
        return;
      }

      this.userService.invite(this.dniBusqueda, managerDni, this.rolElegido).subscribe({
        next: () => {
          this.mensaje = `Invitación enviada correctamente a ${this.dniBusqueda}`;
          this.error = false;
          this.dniBusqueda = '';
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al invitar:', err);
          this.mensaje = err.error?.message || 'Error al enviar invitación. ¿Existe el DNI?';
          this.error = true;
          this.cdr.detectChanges();
        },
      });
    } catch (e) {
      console.error('Error al procesar los datos de sesión:', e);
      this.mensaje = 'Error crítico al procesar la sesión.';
      this.error = true;
    }
  }
}
