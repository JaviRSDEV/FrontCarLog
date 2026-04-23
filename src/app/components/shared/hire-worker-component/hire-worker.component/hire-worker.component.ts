import { Component, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserService } from './../../../../services/userService/user.service';
import { Auth } from '../../../../services/authService/auth.service';

@Component({
  selector: 'app-hire-worker',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './hire-worker.component.html',
  styleUrl: './hire-worker.component.css',
})
export class HireWorkerComponent {
  private readonly userService = inject(UserService);
  private readonly authService = inject(Auth);
  private readonly destroy$ = inject(DestroyRef);

  dniBusqueda = signal<string>('');
  rolElegido = signal<string>('MECHANIC');
  mensaje = signal<string>('');
  error = signal<boolean>(false);

  enviarInvitacion() {
    const userJson = this.authService.getUserFromStorage();

    if (!userJson) {
      this.setMensaje('Error de sesión: No se pudo identificar al administrador.', true);
      return;
    }

    try {
      const manager = JSON.parse(userJson);
      const managerDni = manager.dni;

      if (!managerDni) {
        this.setMensaje('Error: Tus datos de administrador no incluyen DNI.', true);
        return;
      }

      this.userService
        .invite(this.dniBusqueda(), managerDni, this.rolElegido())
        .pipe(takeUntilDestroyed(this.destroy$))
        .subscribe({
          next: () => {
            this.setMensaje(`Invitación enviada correctamente a ${this.dniBusqueda()}`, false);
            this.dniBusqueda.set('');
          },
          error: (err) => {
            console.error('Error al invitar:', err);
            const msg = err.error?.message || 'Error al enviar invitación. ¿Existe el DNI?';
            this.setMensaje(msg, true);
          },
        });
    } catch (e) {
      console.error('Error al procesar los datos de sesión:', e);
      this.setMensaje('Error crítico al procesar la sesión.', true);
    }
  }

  private setMensaje(texto: string, esError: boolean) {
    this.mensaje.set(texto);
    this.error.set(esError);
  }
}
